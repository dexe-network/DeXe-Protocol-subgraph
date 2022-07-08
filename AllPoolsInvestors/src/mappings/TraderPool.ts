import {
  Divested,
  Invested,
  InvestorAdded,
  InvestorRemoved,
  ModifiedPrivateInvestors,
  TraderPool,
  ProposalDivested,
} from "../../generated/templates/TraderPool/TraderPool";
import { PriceFeed } from "../../generated/templates/TraderPool/PriceFeed";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { extendArray, reduceArray, upcastCopy } from "../helpers/ArrayHelper";
import { getInvestor } from "../entities/trader-pool/Investor";
import { getTraderPoolHistory } from "../entities/trader-pool/history/TraderPoolHistory";
import { getInvestorPoolPosition } from "../entities/trader-pool/InvestorPoolPosition";
import { getVest } from "../entities/trader-pool/Vest";
import { getPositionOffset } from "../entities/global/PositionOffset";
import { PRICE_FEED_ADDRESS } from "../entities/global/globals";
import { Investor } from "../../generated/schema";
import { TraderPool as TRP } from "../../generated/schema";
import { getProposalContract } from "../entities/trader-pool/proposal/ProposalContract";
import { getProposalPosition } from "../entities/trader-pool/proposal/ProposalPosition";
import { getProposalVest } from "../entities/trader-pool/proposal/ProposalVest";
import { getProposalPositionOffset } from "../entities/global/ProposalPositionOffset";

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
  let investor = getInvestor(event.params.user);
  let pool = getTraderPool(event.address);
  let positionOffset = getPositionOffset(pool, investor);
  let investorPoolPosition = getInvestorPoolPosition(investor, pool, positionOffset);
  let usdValue = getUSDValue(pool.token, event.params.investedBase);
  let vest = getVest(
    event.transaction.hash,
    investorPoolPosition,
    true,
    event.params.investedBase,
    event.params.receivedLP,
    usdValue,
    event.block.timestamp
  );

  investorPoolPosition.totalBaseInvestVolume = investorPoolPosition.totalBaseInvestVolume.plus(
    event.params.investedBase
  );
  investorPoolPosition.totalLPInvestVolume = investorPoolPosition.totalLPInvestVolume.plus(event.params.receivedLP);
  investorPoolPosition.totalUSDInvestVolume = investorPoolPosition.totalUSDInvestVolume.plus(usdValue);

  investor.save();
  pool.save();
  positionOffset.save();
  investorPoolPosition.save();
  vest.save();
}

export function onDivest(event: Divested): void {
  let investor = getInvestor(event.params.user);
  let pool = getTraderPool(event.address);
  let positionOffset = getPositionOffset(pool, investor);
  let investorPoolPosition = getInvestorPoolPosition(investor, pool, positionOffset);
  let usdValue = getUSDValue(pool.token, event.params.receivedBase);
  let vest = getVest(
    event.transaction.hash,
    investorPoolPosition,
    false,
    event.params.receivedBase,
    event.params.divestedLP,
    usdValue,
    event.block.timestamp
  );

  investorPoolPosition.totalBaseDivestVolume = investorPoolPosition.totalBaseDivestVolume.plus(
    event.params.receivedBase
  );
  investorPoolPosition.totalLPDivestVolume = investorPoolPosition.totalLPDivestVolume.plus(event.params.divestedLP);
  investorPoolPosition.totalUSDDivestVolume = investorPoolPosition.totalUSDDivestVolume.plus(usdValue);

  investor.save();
  pool.save();
  positionOffset.save();
  investorPoolPosition.save();
  vest.save();
}

export function onProposalDivest(event: ProposalDivested): void {
  let pool = getTraderPool(event.address);
  let proposalContract = getProposalContract(Address.fromString(pool.proposalContract.toHexString()));
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

function getUSDValue(token: Bytes, amount: BigInt): BigInt {
  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));
  let usdValue = pfPrototype.try_getNormalizedPriceOutUSD(Address.fromString(token.toHexString()), amount);

  if (!usdValue.reverted) {
    return usdValue.value.value0;
  }

  return BigInt.zero();
}

function getLPBalanceOf(pool: TRP, investor: Investor): BigInt {
  let poolPrototype = TraderPool.bind(Address.fromString(pool.id.toHexString()));
  let LPvalue = poolPrototype.try_balanceOf(Address.fromString(investor.id.toHexString()));

  if (!LPvalue.reverted) {
    return LPvalue.value;
  }

  return BigInt.zero();
}
