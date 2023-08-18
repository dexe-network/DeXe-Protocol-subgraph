import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { pushUnique, remove } from "@solarity/graph-lib";
import {
  Delegated,
  DelegatedTreasury,
  Deposited,
  OffchainResultsSaved,
  ProposalCreated,
  ProposalExecuted,
  Requested,
  RewardClaimed,
  RewardCredited,
  StakingRewardClaimed,
  Voted,
  Withdrawn,
} from "../../generated/templates/DaoPool/DaoPool";
import { getDaoPool } from "../entities/DaoPool";
import { getDelegationHistory } from "../entities/DelegationHistory";
import { getProposal } from "../entities/Proposal";
import { getProposalVote } from "../entities/ProposalVote";
import { getVoter } from "../entities/Voters/Voter";
import { getVoterInPool } from "../entities/Voters/VoterInPool";
import { getVoterInProposal } from "../entities/Voters/VoterInProposal";
import {
  PERCENTAGE_NUMERATOR,
  REWARD_TYPE_VOTE_FOR,
  REWARD_TYPE_VOTE_AGAINST,
  REWARD_TYPE_VOTE_FOR_DELEGATED,
  REWARD_TYPE_VOTE_AGAINST_DELEGATED,
  YEAR,
} from "../entities/global/globals";
import { VoterInPool } from "../../generated/schema";
import { getProposalSettings } from "../entities/Settings/ProposalSettings";
import { getVoterInPoolPair } from "../entities/Voters/VoterInPoolPair";
import { getUSDValue } from "../helpers/PriceFeedInteractions";
import { getVoterOffchain } from "../entities/Voters/VoterOffchain";
import { DelegationType } from "../entities/global/DelegationTypeEnum";
import { VoteType, getEnumBigInt } from "../entities/global/VoteTypeEnum";
import { TreasuryDelegationType } from "../entities/global/TreasuryDelegationTypeEnum";
import { getTreasuryDelegationHistory } from "../entities/TreasuryDelegationHistory";

export function onProposalCreated(event: ProposalCreated): void {
  let pool = getDaoPool(event.address);
  let proposal = getProposal(
    pool,
    event.params.proposalId,
    event.params.sender,
    event.params.quorum,
    event.params.proposalDescription,
    event.params.rewardToken
  );
  let settings = getProposalSettings(pool, event.params.proposalSettings);

  if (proposal.creator != event.params.sender) {
    proposal.creator = event.params.sender;
    proposal.quorum = event.params.quorum;
    proposal.description = event.params.proposalDescription;
  }

  proposal.settings = settings.id;

  pool.proposalCount = pool.proposalCount.plus(BigInt.fromI32(1));

  let voter = getVoter(Address.fromBytes(proposal.creator));

  voter.totalProposalsCreated = voter.totalProposalsCreated.plus(BigInt.fromI32(1));

  voter.save();
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
    event.params.isDelegate ? DelegationType.DELEGATE : DelegationType.UNDELEGATE
  );
  let toVoterInPool = getVoterInPool(pool, to, event.block.timestamp);
  let fromVoterInPool = getVoterInPool(pool, from, event.block.timestamp);

  let pair = getVoterInPoolPair(fromVoterInPool, toVoterInPool);

  const usdAmount = getUSDValue(pool.erc20Token, event.params.amount);

  delegateHistory.pair = pair.id;

  if (event.params.isDelegate) {
    const amountToUnrequest = pair.requestAmount.lt(event.params.amount) ? pair.requestAmount : event.params.amount;
    const availableAmount = event.params.amount.minus(amountToUnrequest);

    from.totalDelegatedUSD = from.totalDelegatedUSD.plus(usdAmount);

    toVoterInPool.receivedDelegation = toVoterInPool.receivedDelegation.plus(event.params.amount);
    toVoterInPool.receivedNFTDelegation = pushUnique<BigInt>(toVoterInPool.receivedNFTDelegation, event.params.nfts);
    toVoterInPool.receivedNFTDelegationCount = BigInt.fromI32(toVoterInPool.receivedNFTDelegation.length);

    if (pair.delegateAmount.equals(BigInt.zero()) && pair.delegateNfts.length == 0) {
      toVoterInPool.currentDelegatorsCount = toVoterInPool.currentDelegatorsCount.plus(BigInt.fromI32(1));
      to.delegatorsCount = to.delegatorsCount.plus(BigInt.fromI32(1));
    }

    pair.delegateAmount = pair.delegateAmount.plus(availableAmount);
    pair.delegateNfts = pushUnique<BigInt>(pair.delegateNfts, event.params.nfts);

    pool.totalCurrentTokenDelegated = pool.totalCurrentTokenDelegated.plus(availableAmount);
    pool.totalCurrentNFTDelegated = pushUnique<BigInt>(pool.totalCurrentNFTDelegated, event.params.nfts);

    pair.requestAmount = pair.requestAmount.minus(amountToUnrequest);
    pair.requestNfts = remove<BigInt>(pair.requestNfts, event.params.nfts);
    toVoterInPool.requestedTokensAmount = toVoterInPool.requestedTokensAmount.minus(amountToUnrequest);
    toVoterInPool.requestedNft = remove<BigInt>(toVoterInPool.requestedNft, event.params.nfts);
    toVoterInPool.requestedNftCount = BigInt.fromI32(toVoterInPool.requestedNft.length);
  } else {
    if (usdAmount.gt(from.totalDelegatedUSD)) {
      from.totalDelegatedUSD = BigInt.zero();
    } else {
      from.totalDelegatedUSD = from.totalDelegatedUSD.minus(usdAmount);
    }

    toVoterInPool.receivedDelegation = toVoterInPool.receivedDelegation.minus(event.params.amount);
    toVoterInPool.receivedNFTDelegation = remove<BigInt>(toVoterInPool.receivedNFTDelegation, event.params.nfts);
    toVoterInPool.receivedNFTDelegationCount = BigInt.fromI32(toVoterInPool.receivedNFTDelegation.length);

    pair.delegateAmount = pair.delegateAmount.minus(event.params.amount);
    pair.delegateNfts = remove<BigInt>(pair.delegateNfts, event.params.nfts);

    if (pair.delegateAmount.equals(BigInt.zero()) && pair.delegateNfts.length == 0) {
      toVoterInPool.currentDelegatorsCount = toVoterInPool.currentDelegatorsCount.minus(BigInt.fromI32(1));
      to.delegatorsCount = to.delegatorsCount.minus(BigInt.fromI32(1));
    }

    pool.totalCurrentTokenDelegated = pool.totalCurrentTokenDelegated.minus(event.params.amount);
    pool.totalCurrentNFTDelegated = remove<BigInt>(pool.totalCurrentNFTDelegated, event.params.nfts);

    let amountToUnrequest = pair.requestAmount.lt(event.params.amount) ? pair.requestAmount : event.params.amount;
    pair.requestAmount = pair.requestAmount.minus(amountToUnrequest);
    pair.requestNfts = remove<BigInt>(pair.requestNfts, event.params.nfts);

    amountToUnrequest = toVoterInPool.requestedTokensAmount.lt(event.params.amount)
      ? toVoterInPool.requestedTokensAmount
      : event.params.amount;
    toVoterInPool.requestedTokensAmount = toVoterInPool.requestedTokensAmount.minus(amountToUnrequest);
    toVoterInPool.requestedNft = remove<BigInt>(toVoterInPool.requestedNft, event.params.nfts);
    toVoterInPool.requestedNftCount = BigInt.fromI32(toVoterInPool.requestedNft.length);
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

export function onDelegatedTreasury(event: DelegatedTreasury): void {
  let to = getVoter(event.params.to);
  let pool = getDaoPool(event.address);
  let toVoterInPool = getVoterInPool(pool, to, event.block.timestamp);
  let delegateHistory = getTreasuryDelegationHistory(
    event.transaction.hash,
    pool,
    event.block.timestamp,
    toVoterInPool,
    event.params.amount,
    event.params.nfts,
    event.params.isDelegate ? TreasuryDelegationType.DELEGATE : TreasuryDelegationType.UNDELEGATE
  );

  if (event.params.isDelegate) {
    toVoterInPool.receivedTreasuryDelegation = toVoterInPool.receivedTreasuryDelegation.plus(event.params.amount);
    toVoterInPool.receivedTreasuryNFTDelegation = pushUnique<BigInt>(
      toVoterInPool.receivedTreasuryNFTDelegation,
      event.params.nfts
    );
    toVoterInPool.receivedTreasuryNFTDelegationCount = BigInt.fromI32(
      toVoterInPool.receivedTreasuryNFTDelegation.length
    );

    pool.totalCurrentTokenDelegatedTreasury = pool.totalCurrentTokenDelegatedTreasury.plus(event.params.amount);
    pool.totalCurrentNFTDelegatedTreasury = pushUnique<BigInt>(
      pool.totalCurrentNFTDelegatedTreasury,
      event.params.nfts
    );
  } else {
    toVoterInPool.receivedTreasuryDelegation = toVoterInPool.receivedTreasuryDelegation.minus(event.params.amount);
    toVoterInPool.receivedTreasuryNFTDelegation = remove<BigInt>(
      toVoterInPool.receivedTreasuryNFTDelegation,
      event.params.nfts
    );
    toVoterInPool.receivedTreasuryNFTDelegationCount = BigInt.fromI32(
      toVoterInPool.receivedTreasuryNFTDelegation.length
    );

    pool.totalCurrentTokenDelegatedTreasury = pool.totalCurrentTokenDelegatedTreasury.minus(event.params.amount);
    pool.totalCurrentNFTDelegatedTreasury = remove<BigInt>(pool.totalCurrentNFTDelegatedTreasury, event.params.nfts);
  }

  if (event.params.amount.gt(BigInt.zero())) {
    if (toVoterInPool.receivedTreasuryDelegation.equals(event.params.amount) && event.params.isDelegate) {
      pool.totalCurrentTokenDelegatees = pool.totalCurrentTokenDelegatees.plus(BigInt.fromI32(1));
    } else if (toVoterInPool.receivedTreasuryDelegation.equals(BigInt.zero()) && !event.params.isDelegate) {
      pool.totalCurrentTokenDelegatees = pool.totalCurrentTokenDelegatees.minus(BigInt.fromI32(1));
    }
  }

  if (event.params.nfts.length > 0) {
    if (toVoterInPool.receivedTreasuryNFTDelegation.length == event.params.nfts.length && event.params.isDelegate) {
      pool.totalCurrentNFTDelegatees = pool.totalCurrentNFTDelegatees.plus(BigInt.fromI32(1));
    } else if (toVoterInPool.receivedTreasuryNFTDelegation.length == 0 && !event.params.isDelegate) {
      pool.totalCurrentNFTDelegatees = pool.totalCurrentNFTDelegatees.minus(BigInt.fromI32(1));
    }
  }

  toVoterInPool.save();
  delegateHistory.save();
  pool.save();
  to.save();
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
    getEnumBigInt(event.params.voteType),
    event.params.amount,
    event.params.isVoteFor
  );

  if (proposalVote.isVoteFor) {
    switch (event.params.voteType) {
      case VoteType.DELEGATED:
      case VoteType.MICROPOOL:
        voterInProposal.totalDelegatedVoteForAmount = voterInProposal.totalDelegatedVoteForAmount.plus(
          event.params.amount
        );
        break;
      case VoteType.PERSONAL:
        voterInProposal.totalVoteForAmount = voterInProposal.totalVoteForAmount.plus(event.params.amount);
        break;
      case VoteType.TREASURY:
        voterInProposal.totalTreasuryVoteForAmount = voterInProposal.totalTreasuryVoteForAmount.plus(
          event.params.amount
        );
        break;
    }

    proposal.currentVotesFor = proposal.currentVotesFor.plus(event.params.amount);
  } else {
    switch (event.params.voteType) {
      case VoteType.MICROPOOL:
      case VoteType.DELEGATED:
        voterInProposal.totalDelegatedVoteAgainstAmount = voterInProposal.totalDelegatedVoteAgainstAmount.plus(
          event.params.amount
        );
        break;
      case VoteType.PERSONAL:
        voterInProposal.totalVoteAgainstAmount = voterInProposal.totalVoteAgainstAmount.plus(event.params.amount);
        break;
      case VoteType.TREASURY:
        voterInProposal.totalTreasuryVoteAgainstAmount = voterInProposal.totalTreasuryVoteAgainstAmount.plus(
          event.params.amount
        );
        break;
    }

    proposal.currentVotesAgainst = proposal.currentVotesAgainst.plus(event.params.amount);
  }

  let newVoters = pushUnique<Bytes>(proposal.voters, [voter.id]);

  if (proposal.voters.length < newVoters.length) {
    proposal.voters = newVoters;
    proposal.votersVoted = proposal.votersVoted.plus(BigInt.fromI32(1));

    voter.totalVotedProposals = voter.totalVotedProposals.plus(BigInt.fromI32(1));
  }

  proposal.votesCount = proposal.votesCount.plus(BigInt.fromI32(1));

  voterInPool.proposals = pushUnique(voterInPool.proposals, [voterInProposal.id]);
  voterInPool.proposalsCount = BigInt.fromI32(voterInPool.proposals.length);

  voter.totalVotes = voter.totalVotes.plus(event.params.amount);

  proposalVote.save();
  voterInProposal.save();
  voterInPool.save();
  proposal.save();
  pool.save();
  voter.save();
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

  let usdAmount = getUSDValue(event.params.token, event.params.amount);

  if (event.params.proposalId.notEqual(BigInt.zero())) {
    let voterInProposal = getVoterInProposal(proposal, voterInPool);

    voterInProposal.claimedRewardUSD = usdAmount;

    voterInProposal.save();
  } else {
    let voterOffchain = getVoterOffchain(voter, pool);

    voterOffchain.claimedRewardUSD = voterOffchain.claimedRewardUSD.plus(usdAmount);

    voterOffchain.save();
  }

  voterInPool.totalClaimedUSD = voterInPool.totalClaimedUSD.plus(usdAmount);
  voter.totalClaimedUSD = voter.totalClaimedUSD.plus(usdAmount);

  voterInPool.save();
  voter.save();
  pool.save();
}

export function onRewardCredited(event: RewardCredited): void {
  let pool = getDaoPool(event.address);
  let voter = getVoter(event.params.sender);
  let voterInPool = getVoterInPool(pool, voter, event.block.timestamp);
  let proposal = getProposal(pool, event.params.proposalId);

  let usdAmount = getUSDValue(event.params.rewardToken, event.params.amount);

  if (event.params.proposalId.notEqual(BigInt.zero())) {
    let voterInProposal = getVoterInProposal(proposal, voterInPool);
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

    voterInPool.proposals = pushUnique(voterInPool.proposals, [voterInProposal.id]);
    voterInPool.proposalsCount = BigInt.fromI32(voterInPool.proposals.length);

    voterInProposal.save();
  } else {
    let voterOffchain = getVoterOffchain(voter, pool);

    voterOffchain.rewardUSD = voterOffchain.rewardUSD.plus(usdAmount);

    voterOffchain.save();
  }

  voter.totalUnclaimedUSD = voter.totalUnclaimedUSD.plus(usdAmount);

  recalculateAPR(voterInPool, usdAmount, event.block.timestamp);

  voterInPool.save();
  voter.save();
  pool.save();
}

export function onDeposited(event: Deposited): void {
  let pool = getDaoPool(event.address);
  let voter = getVoter(event.params.sender);
  let voterInPool = getVoterInPool(pool, voter, event.block.timestamp);
  let usdAmount = getUSDValue(pool.erc20Token, event.params.amount);

  voter.totalLockedFundsUSD = voter.totalLockedFundsUSD.plus(usdAmount);
  voterInPool.totalLockedFundsUSD = voterInPool.totalLockedFundsUSD.plus(usdAmount);

  voterInPool.save();
  voter.save();
  pool.save();
}

export function onWithdrawn(event: Withdrawn): void {
  let pool = getDaoPool(event.address);
  let voter = getVoter(event.params.sender);
  let voterInPool = getVoterInPool(pool, voter, event.block.timestamp);

  let usdAmount = getUSDValue(pool.erc20Token, event.params.amount);

  if (usdAmount.gt(voter.totalLockedFundsUSD)) {
    voter.totalLockedFundsUSD = BigInt.zero();
  } else {
    voter.totalLockedFundsUSD = voter.totalLockedFundsUSD.minus(usdAmount);
  }

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

  const usdAmount = getUSDValue(event.params.token, event.params.amount);
  voter.totalClaimedUSD = voter.totalClaimedUSD.plus(usdAmount);

  voterInPool.totalStakingReward = voterInPool.totalStakingReward.plus(usdAmount);

  voterInPool.save();
  voter.save();
  pool.save();
}

export function onOffchainResultsSaved(event: OffchainResultsSaved): void {
  let pool = getDaoPool(event.address);

  pool.offchainResultsHash = event.params.resultsHash;

  pool.save();
}

export function onRequested(event: Requested): void {
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
    DelegationType.REQUEST
  );
  let toVoterInPool = getVoterInPool(pool, to, event.block.timestamp);
  let fromVoterInPool = getVoterInPool(pool, from, event.block.timestamp);

  let pair = getVoterInPoolPair(fromVoterInPool, toVoterInPool);

  toVoterInPool.requestedTokensAmount = toVoterInPool.requestedTokensAmount.plus(event.params.amount);
  toVoterInPool.requestedNft = pushUnique<BigInt>(toVoterInPool.requestedNft, event.params.nfts);
  toVoterInPool.requestedNftCount = BigInt.fromI32(toVoterInPool.requestedNft.length);

  pair.requestAmount = pair.requestAmount.plus(event.params.amount);
  pair.requestNfts = pushUnique<BigInt>(pair.requestNfts, event.params.nfts);

  delegateHistory.pair = pair.id;

  pair.save();
  fromVoterInPool.save();
  toVoterInPool.save();
  delegateHistory.save();
  pool.save();
  to.save();
  from.save();
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
