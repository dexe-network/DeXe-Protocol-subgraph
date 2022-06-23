import {
  ProposalDivested,
  ProposalInvested,
  ProposalInvestorAdded,
  ProposalInvestorRemoved,
} from "../../generated/templates/Proposal/Proposal";
import { getProposalPosition } from "../entities/trader-pool/proposal/ProposalPosition";
import { getProposalVest } from "../entities/trader-pool/proposal/ProposalVest";
import { getProposalContract } from "../entities/trader-pool/proposal/ProposalContract";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { Address, Bytes, BigInt } from "@graphprotocol/graph-ts";
import { PriceFeed } from "../../generated/templates/TraderPool/PriceFeed";
import { PRICE_FEED_ADDRESS } from "../entities/global/globals";
import { getInvestor } from "../entities/trader-pool/Investor";
import { getProposalPositionOffset } from "../entities/global/ProposalPositionOffset";

export function onProposalInvest(event: ProposalInvested): void {
  let proposalContract = getProposalContract(event.address);
  let investor = getInvestor(event.params.user);
  let pool = getTraderPool(Address.fromString(proposalContract.traderPool));
  let proposalOffset = getProposalPositionOffset(pool, investor, event.params.proposalId);
  let proposal = getProposalPosition(event.params.proposalId, proposalContract, investor, proposalOffset);

  let usdValue = getUSDValue(pool.token, event.params.investedBase);
  let invest = getProposalVest(
    event.transaction.hash,
    proposal,
    true,
    event.params.investedBase,
    event.params.investedLP,
    event.params.receivedLP2,
    usdValue,
    event.block.timestamp
  );

  proposal.totalBaseOpenVolume = proposal.totalBaseOpenVolume.plus(event.params.investedBase);
  proposal.totalLPOpenVolume = proposal.totalLPOpenVolume.plus(event.params.investedLP);
  proposal.totalLP2OpenVolume = proposal.totalLP2OpenVolume.plus(event.params.receivedLP2);
  proposal.totalUSDOpenVolume = proposal.totalUSDOpenVolume.plus(usdValue);

  proposalOffset.save();
  investor.save();
  proposal.save();
  invest.save();
}

export function onProposalDivest(event: ProposalDivested): void {
  let proposalContract = getProposalContract(event.address);
  let investor = getInvestor(event.params.user);
  let pool = getTraderPool(Address.fromString(proposalContract.traderPool));
  let proposalOffset = getProposalPositionOffset(pool, investor, event.params.proposalId);
  let proposal = getProposalPosition(event.params.proposalId, proposalContract, investor, proposalOffset);

  let usdValue = getUSDValue(
    getTraderPool(Address.fromString(proposalContract.traderPool)).token,
    event.params.receivedBase
  );
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

  proposalOffset.save();
  investor.save();
  proposal.save();
  divest.save();
}

export function onProposalInvestorAdded(event: ProposalInvestorAdded): void {
  let proposalContract = getProposalContract(event.address);
  let investor = getInvestor(event.params.investor);
  let pool = getTraderPool(Address.fromString(proposalContract.traderPool));
  let proposalOffset = getProposalPositionOffset(pool, investor, event.params.proposalId);
  let proposal = getProposalPosition(event.params.proposalId, proposalContract, investor, proposalOffset);

  investor.save();
  pool.save();
  proposalOffset.save();
  proposal.save();
}

export function onProposalInvestorRemoved(event: ProposalInvestorRemoved): void {
  let proposalContract = getProposalContract(event.address);
  let investor = getInvestor(event.params.investor);
  let pool = getTraderPool(Address.fromString(proposalContract.traderPool));
  let proposalOffset = getProposalPositionOffset(pool, investor, event.params.proposalId);
  let proposal = getProposalPosition(event.params.proposalId, proposalContract, investor, proposalOffset);

  proposal.isClosed = true;
  proposalOffset.offset = proposalOffset.offset.plus(BigInt.fromI32(1));

  investor.save();
  pool.save();
  proposal.save();
  proposalOffset.save();
}

function getUSDValue(token: Bytes, amount: BigInt): BigInt {
  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));
  let usdValue = pfPrototype.try_getNormalizedPriceOutUSD(Address.fromString(token.toString()), amount);

  if (!usdValue.reverted) {
    return usdValue.value.value0;
  }

  return BigInt.zero();
}