import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { pushUnique, remove } from "@dlsl/graph-modules";
import {
  Delegated,
  Deposited,
  DPCreated,
  OffchainResultsSaved,
  ProposalCreated,
  ProposalExecuted,
  RewardClaimed,
  RewardCredited,
  StakingRewardClaimed,
  Voted,
  Withdrawn,
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
import {
  PERCENTAGE_NUMERATOR,
  PRICE_FEED_ADDRESS,
  REWARD_TYPE_CREATE,
  REWARD_TYPE_VOTE_FOR,
  REWARD_TYPE_VOTE_AGAINST,
  REWARD_TYPE_VOTE_FOR_DELEGATED,
  REWARD_TYPE_VOTE_AGAINST_DELEGATED,
  YEAR,
} from "../entities/global/globals";
import { Proposal, VoterInPool, VoterInProposal } from "../../generated/schema";
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
  let toVoterInPool = getVoterInPool(pool, to, event.block.timestamp);
  let fromVoterInPool = getVoterInPool(pool, from, event.block.timestamp);

  let pair = getVoterInPoolPair(fromVoterInPool, toVoterInPool);

  delegateHistory.pair = pair.id;

  if (event.params.isDelegate) {
    toVoterInPool.receivedDelegation = toVoterInPool.receivedDelegation.plus(event.params.amount);
    toVoterInPool.receivedNFTDelegation = pushUnique<BigInt>(toVoterInPool.receivedNFTDelegation, event.params.nfts);
    toVoterInPool.receivedNFTDelegationCount = BigInt.fromI32(toVoterInPool.receivedNFTDelegation.length);

    if (pair.delegateAmount.equals(BigInt.zero()) && pair.delegateNfts.length == 0) {
      toVoterInPool.currentDelegatorsCount = toVoterInPool.currentDelegatorsCount.plus(BigInt.fromI32(1));
    }

    pair.delegateAmount = pair.delegateAmount.plus(event.params.amount);
    pair.delegateNfts = pushUnique<BigInt>(pair.delegateNfts, event.params.nfts);

    pool.totalCurrentTokenDelegated = pool.totalCurrentTokenDelegated.plus(event.params.amount);
    pool.totalCurrentNFTDelegated = pushUnique<BigInt>(pool.totalCurrentNFTDelegated, event.params.nfts);
  } else {
    toVoterInPool.receivedDelegation = toVoterInPool.receivedDelegation.minus(event.params.amount);
    toVoterInPool.receivedNFTDelegation = remove<BigInt>(toVoterInPool.receivedNFTDelegation, event.params.nfts);
    toVoterInPool.receivedNFTDelegationCount = BigInt.fromI32(toVoterInPool.receivedNFTDelegation.length);

    pair.delegateAmount = pair.delegateAmount.minus(event.params.amount);
    pair.delegateNfts = remove<BigInt>(pair.delegateNfts, event.params.nfts);

    if (pair.delegateAmount.equals(BigInt.zero()) && pair.delegateNfts.length == 0) {
      toVoterInPool.currentDelegatorsCount = toVoterInPool.currentDelegatorsCount.minus(BigInt.fromI32(1));
    }

    pool.totalCurrentTokenDelegated = pool.totalCurrentTokenDelegated.minus(event.params.amount);
    pool.totalCurrentNFTDelegated = remove<BigInt>(pool.totalCurrentNFTDelegated, event.params.nfts);
  }

  if (event.params.amount.gt(BigInt.zero())) {
    if (toVoterInPool.receivedDelegation.equals(event.params.amount) && event.params.isDelegate) {
      pool.totalCurrentTokenDelegatees = pool.totalCurrentTokenDelegatees.plus(BigInt.fromI32(1));
    } else if (toVoterInPool.receivedDelegation.equals(BigInt.zero()) && !event.params.isDelegate) {
      pool.totalCurrentTokenDelegatees = pool.totalCurrentTokenDelegatees.minus(BigInt.fromI32(1));
    }
  }

  if (event.params.nfts.length > 0) {
    if (toVoterInPool.receivedNFTDelegation.length == event.params.nfts.length && event.params.isDelegate) {
      pool.totalCurrentNFTDelegatees = pool.totalCurrentNFTDelegatees.plus(BigInt.fromI32(1));
    } else if (toVoterInPool.receivedNFTDelegation.length == 0 && !event.params.isDelegate) {
      pool.totalCurrentNFTDelegatees = pool.totalCurrentNFTDelegatees.minus(BigInt.fromI32(1));
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
  let voterInPool = getVoterInPool(pool, voter, event.block.timestamp);
  let voterInProposal = getVoterInProposal(proposal, voterInPool);
  let proposalVote = getProposalVote(
    event.transaction.hash,
    voterInProposal,
    event.block.timestamp,
    event.params.personalVote,
    event.params.delegatedVote,
    event.params.isVoteFor
  );

  if (proposalVote.isVoteFor) {
    voterInProposal.totalDelegatedVoteForAmount = voterInProposal.totalDelegatedVoteForAmount.plus(
      event.params.delegatedVote
    );
    voterInProposal.totalVoteForAmount = voterInProposal.totalVoteForAmount.plus(event.params.personalVote);

    proposal.currentVotesFor = proposal.currentVotesFor
      .plus(event.params.personalVote)
      .plus(event.params.delegatedVote);
  } else {
    voterInProposal.totalDelegatedVoteAgainstAmount = voterInProposal.totalDelegatedVoteAgainstAmount.plus(
      event.params.delegatedVote
    );
    voterInProposal.totalVoteAgainstAmount = voterInProposal.totalVoteAgainstAmount.plus(event.params.personalVote);

    proposal.currentVotesAgainst = proposal.currentVotesAgainst
      .plus(event.params.personalVote)
      .plus(event.params.delegatedVote);
  }

  let newVoters = pushUnique<Bytes>(proposal.voters, [voter.id]);

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

  proposal.isFor = event.params.isFor;
  proposal.executor = event.params.sender;
  proposal.executionTimestamp = event.block.timestamp;

  proposal.save();
  pool.save();
}

export function onRewardClaimed(event: RewardClaimed): void {
  let pool = getDaoPool(event.address);
  let voter = getVoter(event.params.sender);
  let voterInPool = getVoterInPool(pool, voter, event.block.timestamp);
  let proposal = getProposal(pool, event.params.proposalId);
  let voterInProposal = getVoterInProposal(proposal, voterInPool);

  let usdAmount = getUSDValue(event.params.token, event.params.amount);

  voterInProposal.claimedRewardUSD = usdAmount;

  voterInProposal.save();

  voterInPool.totalClaimedUSD = voterInPool.totalClaimedUSD.plus(usdAmount);

  voterInPool.save();
  voter.save();
  pool.save();
}

export function onRewardCredited(event: RewardCredited): void {
  let pool = getDaoPool(event.address);
  let voter = getVoter(event.params.sender);
  let voterInPool = getVoterInPool(pool, voter, event.block.timestamp);
  let proposal = getProposal(pool, event.params.proposalId);
  let voterInProposal = getVoterInProposal(proposal, voterInPool);

  let usdAmount = getUSDValue(event.params.rewardToken, event.params.amount);

  const rewardType = event.params.rewardType;

  if (rewardType == REWARD_TYPE_VOTE_FOR_DELEGATED) {
    voterInProposal.unclaimedRewardFromDelegationsUSDFor =
      voterInProposal.unclaimedRewardFromDelegationsUSDFor.plus(usdAmount);
    voterInPool.totalDelegationRewardUSDFor = voterInPool.totalDelegationRewardUSDFor.plus(usdAmount);
  } else if (rewardType == REWARD_TYPE_VOTE_AGAINST_DELEGATED) {
    voterInProposal.unclaimedRewardFromDelegationsUSDAgainst =
      voterInProposal.unclaimedRewardFromDelegationsUSDAgainst.plus(usdAmount);
    voterInPool.totalDelegationRewardUSDAgainst = voterInPool.totalDelegationRewardUSDAgainst.plus(usdAmount);
  }

  if (rewardType == REWARD_TYPE_VOTE_FOR || rewardType == REWARD_TYPE_VOTE_FOR_DELEGATED) {
    voterInProposal.unclaimedRewardUSDFor = voterInProposal.unclaimedRewardUSDFor.plus(usdAmount);
  } else if (rewardType == REWARD_TYPE_VOTE_AGAINST || rewardType == REWARD_TYPE_VOTE_AGAINST_DELEGATED) {
    voterInProposal.unclaimedRewardUSDAgainst = voterInProposal.unclaimedRewardUSDAgainst.plus(usdAmount);
  } else {
    voterInProposal.unclaimedRewardUSDFor = voterInProposal.unclaimedRewardUSDFor.plus(usdAmount);
    voterInProposal.unclaimedRewardUSDAgainst = voterInProposal.unclaimedRewardUSDAgainst.plus(usdAmount);
  }

  recalculateAPR(voterInPool, usdAmount, event.block.timestamp);

  voterInProposal.save();
  voterInPool.save();
  voter.save();
  pool.save();
}

export function onDeposited(event: Deposited): void {
  let pool = getDaoPool(event.address);
  let voter = getVoter(event.params.sender);
  let voterInPool = getVoterInPool(pool, voter, event.block.timestamp);

  voterInPool.totalLockedFundsUSD = voterInPool.totalLockedFundsUSD.plus(
    getUSDValue(pool.erc20Token, event.params.amount)
  );

  voterInPool.save();
  voter.save();
  pool.save();
}

export function onWithdrawn(event: Withdrawn): void {
  let pool = getDaoPool(event.address);
  let voter = getVoter(event.params.sender);
  let voterInPool = getVoterInPool(pool, voter, event.block.timestamp);

  let usdAmount = getUSDValue(pool.erc20Token, event.params.amount);

  if (usdAmount.gt(voterInPool.totalLockedFundsUSD)) {
    voterInPool.totalLockedFundsUSD = BigInt.zero();
  } else {
    voterInPool.totalLockedFundsUSD = voterInPool.totalLockedFundsUSD.minus(usdAmount);
  }

  voterInPool.save();
  voter.save();
  pool.save();
}

export function onStakingRewardClaimed(event: StakingRewardClaimed): void {
  let pool = getDaoPool(event.address);
  let voter = getVoter(event.params.user);
  let voterInPool = getVoterInPool(pool, voter, event.block.timestamp);

  voterInPool.totalStakingReward = voterInPool.totalStakingReward.plus(
    getUSDValue(event.params.token, event.params.amount)
  );

  voterInPool.save();
  voter.save();
  pool.save();
}

export function onOffchainResultsSaved(event: OffchainResultsSaved): void {
  let pool = getDaoPool(event.address);

  pool.offchainResultsHash = event.params.resultsHash;

  pool.save();
}

function recalculateAPR(voterInPool: VoterInPool, rewardCredited: BigInt, currentTimestamp: BigInt): void {
  if (
    voterInPool.totalLockedFundsUSD.notEqual(BigInt.zero()) &&
    currentTimestamp.notEqual(voterInPool.joinedTimestamp)
  ) {
    let RLRatio = rewardCredited.times(BigInt.fromI32(PERCENTAGE_NUMERATOR)).div(voterInPool.totalLockedFundsUSD);
    let numerator = voterInPool.cusum
      .times(voterInPool.lastUpdate.minus(voterInPool.joinedTimestamp))
      .plus(RLRatio.times(currentTimestamp.minus(voterInPool.joinedTimestamp)));
    let denominator = currentTimestamp.minus(voterInPool.joinedTimestamp);
    let P = numerator.div(denominator);

    voterInPool.APR = P.times(YEAR).div(currentTimestamp.minus(voterInPool.joinedTimestamp));
    voterInPool.cusum = P;
    voterInPool.lastUpdate = currentTimestamp;
  }
}
