import {
  Divested,
  Invested,
  InvestorAdded,
  InvestorRemoved,
  ModifiedPrivateInvestors,
  TraderPool,
  ProposalDivested,
  Transfer,
} from "../../generated/templates/TraderPool/TraderPool";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { extendArray, reduceArray, upcastCopy } from "../helpers/ArrayHelper";
import { getInvestor } from "../entities/trader-pool/Investor";
import { getTraderPoolHistory } from "../entities/trader-pool/history/TraderPoolHistory";
import { getInvestorPoolPosition } from "../entities/trader-pool/InvestorPoolPosition";
import { getVest } from "../entities/trader-pool/Vest";
import { getPositionOffset } from "../entities/global/PositionOffset";
import { BTC_ADDRESS, WBNB_ADDRESS } from "../entities/global/globals";
import { Investor, InvestorPoolPosition, LpHistory } from "../../generated/schema";
import { getProposalContract } from "../entities/trader-pool/proposal/ProposalContract";
import { getProposalPosition } from "../entities/trader-pool/proposal/ProposalPosition";
import { getProposalVest } from "../entities/trader-pool/proposal/ProposalVest";
import { getProposalPositionOffset } from "../entities/global/ProposalPositionOffset";
import { getLpHistory } from "../entities/trader-pool/history/LpHistory";
import { findPrevHistory } from "../helpers/HistorySearcher";
import { getTokenValue, getUSDValue } from "../helpers/PriceFeedInteractions";

export function onInvestorAdded(event: InvestorAdded): void {
  let pool = getTraderPool(event.address);
  let history = getTraderPoolHistory(pool, event.block.timestamp);

  let investor = getInvestor(event.params.investor);
  pool.investors = extendArray(pool.investors, [investor.id]);
  pool.investorsCount = pool.investorsCount.plus(BigInt.fromI32(1));

  history.investors = extendArray(history.investors, [investor.id]);
  history.investorsCount = history.investorsCount.plus(BigInt.fromI32(1));

  investor.activePools = extendArray(investor.activePools, [pool.id]);
  investor.allPools = extendArray(investor.allPools, [pool.id]);

  let positionOffset = getPositionOffset(pool, investor);
  let investorPoolPosition = getInvestorPoolPosition(investor, pool, positionOffset);

  positionOffset.save();
  investorPoolPosition.save();
  investor.save();
  pool.save();
  history.save();
}

export function onInvestorRemoved(event: InvestorRemoved): void {
  let pool = getTraderPool(event.address);
  let history = getTraderPoolHistory(pool, event.block.timestamp);

  let investor = getInvestor(event.params.investor);
  pool.investors = reduceArray(pool.investors, [investor.id]);
  pool.investorsCount = pool.investorsCount.minus(BigInt.fromI32(1));

  history.investors = reduceArray(history.investors, [investor.id]);
  history.investorsCount = history.investorsCount.minus(BigInt.fromI32(1));

  investor.activePools = reduceArray(investor.activePools, [pool.id]);

  let positionOffset = getPositionOffset(pool, investor);
  let investorPoolPosition = getInvestorPoolPosition(investor, pool, positionOffset);

  positionOffset.offset = positionOffset.offset.plus(BigInt.fromI32(1));
  investorPoolPosition.isClosed = true;

  positionOffset.save();
  investorPoolPosition.save();

  investor.save();
  pool.save();
  history.save();
}

export function onModifiedPrivateInvestors(event: ModifiedPrivateInvestors): void {
  let pool = getTraderPool(event.address);
  let history = getTraderPoolHistory(pool, event.block.timestamp);

  let upcastedArray = upcastCopy<Address, Bytes>(event.params.privateInvestors);

  if (event.params.add) {
    pool.privateInvestors = extendArray(pool.privateInvestors, upcastedArray);
    pool.privateInvestorsCount = pool.privateInvestorsCount.plus(BigInt.fromI32(event.params.privateInvestors.length));

    history.privateInvestors = extendArray(history.privateInvestors, upcastedArray);
    history.privateInvestorsCount = history.privateInvestorsCount.plus(
      BigInt.fromI32(event.params.privateInvestors.length)
    );
  } else {
    pool.privateInvestors = reduceArray(pool.privateInvestors, upcastedArray);
    pool.privateInvestorsCount = pool.privateInvestorsCount.minus(BigInt.fromI32(event.params.privateInvestors.length));

    history.privateInvestors = reduceArray(history.privateInvestors, upcastedArray);
    history.privateInvestorsCount = history.privateInvestorsCount.minus(
      BigInt.fromI32(event.params.privateInvestors.length)
    );
  }
  pool.save();
  history.save();
}

export function onInvest(event: Invested): void {
  setupVest(event.params.investedBase, event.params.receivedLP, event.params.user, true, event);
}

export function onDivest(event: Divested): void {
  setupVest(event.params.receivedBase, event.params.divestedLP, event.params.user, false, event);
}

export function onProposalDivest(event: ProposalDivested): void {
  let pool = getTraderPool(event.address);
  let proposalContract = getProposalContract(Address.fromBytes(pool.proposalContract));
  let investor = getInvestor(event.params.user);
  let proposalOffset = getProposalPositionOffset(pool, investor, event.params.proposalId);
  let proposal = getProposalPosition(event.params.proposalId, proposalContract, investor, proposalOffset);

  let usdValue = getUSDValue(pool.token, event.params.receivedBase);
  let divest = getProposalVest(
    event.transaction.hash,
    proposal,
    false,
    event.params.receivedBase,
    event.params.receivedLP,
    event.params.divestedLP2,
    usdValue,
    event.block.timestamp
  );

  proposal.totalBaseCloseVolume = proposal.totalBaseCloseVolume.plus(event.params.receivedBase);
  proposal.totalLPCloseVolume = proposal.totalLPCloseVolume.plus(event.params.receivedLP);
  proposal.totalLP2CloseVolume = proposal.totalLP2CloseVolume.plus(event.params.divestedLP2);
  proposal.totalUSDCloseVolume = proposal.totalUSDCloseVolume.plus(usdValue);

  pool.save();
  investor.save();
  proposalOffset.save();
  proposal.save();
  divest.save();
}

function setupVest(vestInBase: BigInt, vestLp: BigInt, user: Address, isInvest: boolean, event: ethereum.Event): void {
  let investor = getInvestor(user);
  let pool = getTraderPool(event.address);
  let positionOffset = getPositionOffset(pool, investor);
  let investorPoolPosition = getInvestorPoolPosition(investor, pool, positionOffset);
  let usdValue = getUSDValue(pool.token, vestInBase);
  let bnbValue = getTokenValue(pool.token, Address.fromString(WBNB_ADDRESS), vestInBase);
  let btcValue = getTokenValue(pool.token, Address.fromString(BTC_ADDRESS), vestInBase);
  let vest = getVest(
    event.transaction.hash,
    investorPoolPosition,
    isInvest,
    vestInBase,
    vestLp,
    usdValue,
    bnbValue,
    btcValue,
    event.block.timestamp
  );

  let lpHistory = getLpHistory(investorPoolPosition, event.block.timestamp);
  injectPrevLPHistory(lpHistory, investorPoolPosition);

  if (isInvest) {
    investorPoolPosition.totalBaseInvestVolume = investorPoolPosition.totalBaseInvestVolume.plus(vestInBase);
    investorPoolPosition.totalLPInvestVolume = investorPoolPosition.totalLPInvestVolume.plus(vestLp);
    investorPoolPosition.totalUSDInvestVolume = investorPoolPosition.totalUSDInvestVolume.plus(usdValue);
    investorPoolPosition.totalNativeInvestVolume = investorPoolPosition.totalNativeInvestVolume.plus(bnbValue);
    investorPoolPosition.totalBTCInvestVolume = investorPoolPosition.totalBTCInvestVolume.plus(btcValue);

    lpHistory.currentLpAmount = lpHistory.currentLpAmount.plus(vestLp);
  } else {
    investorPoolPosition.totalBaseDivestVolume = investorPoolPosition.totalBaseDivestVolume.plus(vestInBase);
    investorPoolPosition.totalLPDivestVolume = investorPoolPosition.totalLPDivestVolume.plus(vestLp);
    investorPoolPosition.totalUSDDivestVolume = investorPoolPosition.totalUSDDivestVolume.plus(usdValue);
    investorPoolPosition.totalNativeDivestVolume = investorPoolPosition.totalNativeDivestVolume.plus(bnbValue);
    investorPoolPosition.totalBTCDivestVolume = investorPoolPosition.totalBTCDivestVolume.plus(btcValue);

    lpHistory.currentLpAmount = lpHistory.currentLpAmount.minus(vestLp);
  }

  lpHistory.save();
  investor.save();
  pool.save();
  positionOffset.save();
  investorPoolPosition.save();
  vest.save();
}

function injectPrevLPHistory(history: LpHistory, investorPoolPosition: InvestorPoolPosition): void {
  if (history.prevHistory == "") {
    let prevHistory = findPrevHistory<LpHistory>(
      LpHistory.load,
      investorPoolPosition.id,
      history.day,
      BigInt.fromI32(1)
    );
    if (prevHistory != null) {
      history.prevHistory = prevHistory.id;
      history.currentLpAmount = prevHistory.currentLpAmount;
    }
  }
}
