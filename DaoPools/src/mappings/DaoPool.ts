import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import {
  Delegated,
  DPCreated,
  ProposalCreated,
  ProposalExecuted,
  RewardClaimed,
  Undelegated,
  Voted,
} from "../../generated/templates/DaoPool/DaoPool";
import { getDaoPool } from "../entities/DaoPool";
import { getDelegationHistory } from "../entities/DelegationHistory";
import { getDistributionProposal } from "../entities/DistributionProposal";
import { getEnumBigInt, ProposalType } from "../entities/global/ProposalTypes";
import { getProposal } from "../entities/Proposal";
import { getProposalVote } from "../entities/ProposalVote";
import { getVoter } from "../entities/Voters/Voter";
import { getVoterInPool } from "../entities/Voters/VoterInPool";
import { getVoterInProposal } from "../entities/Voters/VoterInProposal";
import { PriceFeed } from "../../generated/templates/DaoPool/PriceFeed";
import { PRICE_FEED_ADDRESS } from "../entities/global/globals";

export function onProposalCreated(event: ProposalCreated): void {
  let pool = getDaoPool(event.address);
  let proposal = getProposal(pool, event.params.proposalId, event.params.sender, event.params.quorum);

  pool.save();
  proposal.save();
}

export function onDelegated(event: Delegated): void {
  let from = getVoter(event.params.from);
  let to = getVoter(event.params.to);
  let pool = getDaoPool(event.address);
  let delegateHistory = getDelegationHistory(
    event.transaction.hash,
    pool,
    event.block.timestamp,
    from,
    to,
    event.params.amount,
    true
  );
  let voterInPool = getVoterInPool(pool, to);

  voterInPool.receivedDelegation = voterInPool.receivedDelegation.plus(event.params.amount);

  voterInPool.save();
  delegateHistory.save();
  pool.save();
  to.save();
  from.save();
}

export function onUndelegeted(event: Undelegated): void {
  let from = getVoter(event.params.from);
  let to = getVoter(event.params.to);
  let pool = getDaoPool(event.address);
  let delegateHistory = getDelegationHistory(
    event.transaction.hash,
    pool,
    event.block.timestamp,
    from,
    to,
    event.params.amount,
    false
  );
  let voterInPool = getVoterInPool(pool, to);

  voterInPool.receivedDelegation = voterInPool.receivedDelegation.minus(event.params.amount);

  voterInPool.save();
  delegateHistory.save();
  pool.save();
  to.save();
  from.save();
}

export function onVoted(event: Voted): void {
  let voter = getVoter(event.params.sender);
  let pool = getDaoPool(event.address);
  let proposal = getProposal(pool, event.params.proposalId);
  let voterInPool = getVoterInPool(pool, voter);
  let voterInProposal = getVoterInProposal(proposal, voterInPool);
  let proposalVote = getProposalVote(
    event.transaction.hash,
    voterInProposal,
    event.block.timestamp,
    event.params.personalVote,
    event.params.delegatedVote
  );

  voterInProposal.totalDelegatedVoteAmount = voterInProposal.totalDelegatedVoteAmount.plus(event.params.delegatedVote);
  voterInProposal.totalVoteAmount = voterInProposal.totalVoteAmount.plus(event.params.personalVote);

  proposal.currentVotes = proposal.currentVotes.plus(event.params.personalVote).plus(event.params.delegatedVote);

  proposalVote.save();
  voterInProposal.save();
  voterInPool.save();
  proposal.save();
  pool.save();
  voter.save();
}

export function onDPCreated(event: DPCreated): void {
  let pool = getDaoPool(event.address);
  let proposal = getProposal(pool, event.params.proposalId);
  let dp = getDistributionProposal(proposal, event.params.token, event.params.amount);

  proposal.proposalType = getEnumBigInt(ProposalType.DISTRIBUTION);
  proposal.distributionProposal = dp.id;

  dp.save();
  proposal.save();
  pool.save();
}

export function onProposalExecuted(event: ProposalExecuted): void {
  let pool = getDaoPool(event.address);
  let proposal = getProposal(pool, event.params.proposalId);

  proposal.executor = event.params.sender;
  proposal.executionTimestamp = event.block.timestamp;

  proposal.save();
  pool.save();
}

export function onRewardClaimed(event: RewardClaimed): void {
  let pool = getDaoPool(event.address);
  let voter = getVoter(event.params.sender);
  let voterInPool = getVoterInPool(pool, voter);

  voterInPool.totalClaimedUSD = totalTokenUSDCost(event.params.tokens, event.params.amounts);

  voterInPool.save();
  voter.save();
  pool.save();
}

function totalTokenUSDCost(tokens: Array<Address>, volumes: Array<BigInt>): BigInt {
  let totalCost = BigInt.zero();
  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));

  for (let i = 0; i < tokens.length; i++) {
    totalCost = totalCost.plus(getUSDFromPriceFeed(pfPrototype, tokens[i], volumes[i]));
  }

  return totalCost;
}

function getUSDFromPriceFeed(pfPrototype: PriceFeed, baseTokenAddress: Address, fromBaseVolume: BigInt): BigInt {
  let resp = pfPrototype.try_getNormalizedPriceOutUSD(baseTokenAddress, fromBaseVolume);
  if (resp.reverted) {
    log.warning("try_getNormalizedPriceOutUSD reverted. FromToken: {}, Amount:{}", [
      baseTokenAddress.toHexString(),
      fromBaseVolume.toString(),
    ]);
    return BigInt.zero();
  } else {
    if (resp.value.value1.length == 0) {
      log.warning("try_getNormalizedPriceOutUSD returned 0 length path. FromToken: {}, Amount:{}", [
        baseTokenAddress.toHexString(),
        fromBaseVolume.toString(),
      ]);
    }
    return resp.value.value0;
  }
}
