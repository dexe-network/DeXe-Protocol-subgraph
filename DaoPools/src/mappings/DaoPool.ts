import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  Delegated,
  DPCreated,
  ProposalCreated,
  ProposalExecuted,
  RewardClaimed,
  RewardCredited,
  Voted,
} from "../../generated/templates/DaoPool/DaoPool";
import { getDaoPool } from "../entities/DaoPool";
import { getDelegationHistory } from "../entities/DelegationHistory";
import { getDistributionProposal } from "../entities/DistributionProposal";
import { getProposal } from "../entities/Proposal";
import { getProposalVote } from "../entities/ProposalVote";
import { getVoter } from "../entities/Voters/Voter";
import { getVoterInPool } from "../entities/Voters/VoterInPool";
import { getVoterInProposal } from "../entities/Voters/VoterInProposal";
import { PriceFeed } from "../../generated/templates/DaoPool/PriceFeed";
import { PRICE_FEED_ADDRESS } from "../entities/global/globals";
import { Proposal, VoterInProposal } from "../../generated/schema";
import { extendArray, reduceArray } from "../helpers/ArrayHelper";
import { getProposalSettings } from "../entities/Settings/ProposalSettings";
import { getVoterInPoolPair } from "../entities/Voters/VoterInPoolPair";
import { getUSDValue } from "../helpers/PriceFeedInteractions";

export function onProposalCreated(event: ProposalCreated): void {
  let pool = getDaoPool(event.address);
  let proposal = getProposal(
    pool,
    event.params.proposalId,
    event.params.sender,
    event.params.quorum,
    event.params.proposalDescription,
    event.params.rewardToken,
    event.params.misc
  );
  let settings = getProposalSettings(pool, event.params.proposalSettings);

  if (proposal.creator != event.params.sender) {
    proposal.creator = event.params.sender;
    proposal.quorum = event.params.quorum;
    proposal.description = event.params.proposalDescription;
  }

  proposal.settings = settings.id;

  pool.proposalCount = pool.proposalCount.plus(BigInt.fromI32(1));

  settings.save();
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
    event.params.nfts,
    event.params.isDelegate
  );
  let toVoterInPool = getVoterInPool(pool, to);
  let fromVoterInPool = getVoterInPool(pool, from);

  let pair = getVoterInPoolPair(fromVoterInPool, toVoterInPool);

  delegateHistory.pair = pair.id;

  if (event.params.isDelegate) {
    toVoterInPool.receivedDelegation = toVoterInPool.receivedDelegation.plus(event.params.amount);
    toVoterInPool.receivedNFTDelegation = extendArray<BigInt>(toVoterInPool.receivedNFTDelegation, event.params.nfts);

    if (pair.delegateAmount.equals(BigInt.zero()) && pair.delegateNfts.length == 0) {
      toVoterInPool.currentDelegatorsCount = toVoterInPool.currentDelegatorsCount.plus(BigInt.fromI32(1));
    }

    pair.delegateAmount = pair.delegateAmount.plus(event.params.amount);
    pair.delegateNfts = extendArray<BigInt>(pair.delegateNfts, event.params.nfts);

    pool.totalCurrentTokenDelegated = pool.totalCurrentTokenDelegated.plus(event.params.amount);
    pool.totalCurrentNFTDelegated = extendArray<BigInt>(pool.totalCurrentNFTDelegated, event.params.nfts);
  } else {
    toVoterInPool.receivedDelegation = toVoterInPool.receivedDelegation.minus(event.params.amount);
    toVoterInPool.receivedNFTDelegation = reduceArray<BigInt>(toVoterInPool.receivedNFTDelegation, event.params.nfts);

    pair.delegateAmount = pair.delegateAmount.minus(event.params.amount);
    pair.delegateNfts = reduceArray<BigInt>(pair.delegateNfts, event.params.nfts);

    if (pair.delegateAmount.equals(BigInt.zero()) && pair.delegateNfts.length == 0) {
      toVoterInPool.currentDelegatorsCount = toVoterInPool.currentDelegatorsCount.minus(BigInt.fromI32(1));
    }

    pool.totalCurrentTokenDelegated = pool.totalCurrentTokenDelegated.minus(event.params.amount);
    pool.totalCurrentNFTDelegated = reduceArray<BigInt>(pool.totalCurrentNFTDelegated, event.params.nfts);
  }

  if (event.params.amount.gt(BigInt.zero())) {
    let tokenDelegatees = extendArray(pool.tokenDelegatees, [event.params.to]);
    if (tokenDelegatees.length > pool.tokenDelegatees.length) {
      pool.totalTokenDelegatees = pool.totalTokenDelegatees.plus(BigInt.fromI32(1));
      pool.tokenDelegatees = tokenDelegatees;
    }
  }

  if (event.params.nfts.length > 0) {
    let nftDelegatees = extendArray(pool.nftDelegatees, [event.params.to]);
    if (nftDelegatees.length > pool.nftDelegatees.length) {
      pool.totalNFTDelegatees = pool.totalNFTDelegatees.plus(BigInt.fromI32(1));
      pool.tokenDelegatees = nftDelegatees;
    }
  }

  pair.save();
  fromVoterInPool.save();
  toVoterInPool.save();
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
  let newVoters = extendArray<Bytes>(proposal.voters, [voter.id]);

  if (proposal.voters.length < newVoters.length) {
    proposal.voters = newVoters;
    proposal.votersVoted = proposal.votersVoted.plus(BigInt.fromI32(1));
  }

  proposal.votesCount = proposal.votesCount.plus(BigInt.fromI32(1));

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

  proposal.isDP = true;

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
  let proposal = getProposal(pool, event.params.proposalId);
  let voterInProposal = getVoterInProposal(proposal, voterInPool);

  voterInProposal.claimedReward = event.params.amount;

  voterInProposal.save();

  voterInPool.totalClaimedUSD = voterInPool.totalClaimedUSD.plus(getUSDValue(event.params.token, event.params.amount));

  voterInPool.save();
  voter.save();
  pool.save();
}

export function onRewardCredited(event: RewardCredited): void {
  let pool = getDaoPool(event.address);
  let voter = getVoter(event.params.sender);
  let voterInPool = getVoterInPool(pool, voter);
  let proposal = getProposal(pool, event.params.proposalId);
  let voterInProposal = getVoterInProposal(proposal, voterInPool);

  voterInProposal.unclaimedReward = voterInProposal.unclaimedReward.plus(event.params.amount);

  voterInProposal.save();
  voterInPool.save();
  voter.save();
  pool.save();
}
