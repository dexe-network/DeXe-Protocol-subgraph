import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { pushUnique, remove } from "@solarity/graph-lib";
import {
  Delegated,
  DelegatedTreasury,
  Deposited,
  OffchainResultsSaved,
  ProposalCreated,
  ProposalExecuted,
  RewardClaimed,
  RewardCredited,
  MicropoolRewardClaimed,
  VoteChanged,
  Withdrawn,
} from "../../generated/templates/DaoPool/DaoPool";
import { getDaoPool } from "../entities/DaoPool";
import { getDelegationHistory } from "../entities/DelegationHistory";
import { getProposal } from "../entities/Proposal";
import { getProposalInteraction } from "../entities/ProposalInteraction";
import { getVoter } from "../entities/Voters/Voter";
import { getVoterInPool } from "../entities/Voters/VoterInPool";
import { getVoterInProposal } from "../entities/Voters/VoterInProposal";
import { PERCENTAGE_NUMERATOR, YEAR } from "../entities/global/globals";
import { VoterInPool } from "../../generated/schema";
import { getProposalSettings } from "../entities/Settings/ProposalSettings";
import { getVoterInPoolPair } from "../entities/Voters/VoterInPoolPair";
import { getUSDValue } from "../helpers/PriceFeedInteractions";
import { DelegationType } from "../entities/global/DelegationTypeEnum";
import { TreasuryDelegationType } from "../entities/global/TreasuryDelegationTypeEnum";
import { getTreasuryDelegationHistory } from "../entities/TreasuryDelegationHistory";
import { RewardType } from "../entities/global/RewardTypeEnum";
import { ProposalInteractionType, getEnumBigInt } from "../entities/global/ProposalInteractionTypeEnum";

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
    from.totalDelegatedUSD = from.totalDelegatedUSD.plus(usdAmount);

    toVoterInPool.receivedDelegation = toVoterInPool.receivedDelegation.plus(event.params.amount);
    toVoterInPool.receivedNFTDelegation = pushUnique<BigInt>(toVoterInPool.receivedNFTDelegation, event.params.nfts);
    toVoterInPool.receivedNFTDelegationCount = BigInt.fromI32(toVoterInPool.receivedNFTDelegation.length);

    if (pair.delegatedAmount.equals(BigInt.zero()) && pair.delegatedNfts.length == 0) {
      toVoterInPool.currentDelegatorsCount = toVoterInPool.currentDelegatorsCount.plus(BigInt.fromI32(1));
      to.delegatorsCount = to.delegatorsCount.plus(BigInt.fromI32(1));
    }

    pair.delegatedAmount = pair.delegatedAmount.plus(event.params.amount);
    pair.delegatedNfts = pushUnique<BigInt>(pair.delegatedNfts, event.params.nfts);

    pool.totalCurrentTokenDelegated = pool.totalCurrentTokenDelegated.plus(event.params.amount);
    pool.totalCurrentNFTDelegated = pushUnique<BigInt>(pool.totalCurrentNFTDelegated, event.params.nfts);
  } else {
    if (usdAmount.gt(from.totalDelegatedUSD)) {
      from.totalDelegatedUSD = BigInt.zero();
    } else {
      from.totalDelegatedUSD = from.totalDelegatedUSD.minus(usdAmount);
    }

    toVoterInPool.receivedDelegation = toVoterInPool.receivedDelegation.minus(event.params.amount);
    toVoterInPool.receivedNFTDelegation = remove<BigInt>(toVoterInPool.receivedNFTDelegation, event.params.nfts);
    toVoterInPool.receivedNFTDelegationCount = BigInt.fromI32(toVoterInPool.receivedNFTDelegation.length);

    pair.delegatedAmount = pair.delegatedAmount.minus(event.params.amount);
    pair.delegatedNfts = remove<BigInt>(pair.delegatedNfts, event.params.nfts);

    if (pair.delegatedAmount.equals(BigInt.zero()) && pair.delegatedNfts.length == 0) {
      toVoterInPool.currentDelegatorsCount = toVoterInPool.currentDelegatorsCount.minus(BigInt.fromI32(1));
      to.delegatorsCount = to.delegatorsCount.minus(BigInt.fromI32(1));
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

export function onVoteChanged(event: VoteChanged): void {
  let voter = getVoter(event.params.voter);
  let pool = getDaoPool(event.address);
  let proposal = getProposal(pool, event.params.proposalId);
  let voterInPool = getVoterInPool(pool, voter, event.block.timestamp);
  let voterInProposal = getVoterInProposal(proposal, voterInPool);

  let interactionType = event.params.isVoteFor
    ? ProposalInteractionType.VOTE_FOR
    : ProposalInteractionType.VOTE_AGAINST;

  if (
    isZero(event.params.votes.personal) &&
    isZero(event.params.votes.micropool) &&
    isZero(event.params.votes.treasury)
  ) {
    interactionType = ProposalInteractionType.VOTE_CANCEL;
  }

  getProposalInteraction(
    event.transaction.hash,
    voterInProposal,
    event.block.timestamp,
    getEnumBigInt(interactionType),
    event.params.votes.personal,
    event.params.votes.micropool,
    event.params.votes.treasury
  ).save();

  const totalVotes = event.params.votes.personal.plus(event.params.votes.micropool).plus(event.params.votes.treasury);

  if (interactionType == ProposalInteractionType.VOTE_CANCEL) {
    const prevVotes = voterInProposal.personalVote
      .plus(voterInProposal.micropoolVote)
      .plus(voterInProposal.treasuryVote);

    if (voterInProposal.isVoteFor) {
      proposal.currentVotesFor = proposal.currentVotesFor.minus(prevVotes);
    } else {
      proposal.currentVotesAgainst = proposal.currentVotesAgainst.minus(prevVotes);
    }

    proposal.voters = remove<Bytes>(proposal.voters, [voter.id]);
    proposal.votersVoted = proposal.votersVoted.minus(BigInt.fromI32(1));

    voter.totalVotedProposals = voter.totalVotedProposals.minus(BigInt.fromI32(1));

    voterInPool.proposals = remove(voterInPool.proposals, [voterInProposal.id]);
    voterInPool.engagedProposalsCount = BigInt.fromI32(voterInPool.proposals.length);

    voter.totalVotes = voter.totalVotes.minus(prevVotes);
  } else {
    if (interactionType == ProposalInteractionType.VOTE_FOR) {
      proposal.currentVotesFor = proposal.currentVotesFor.plus(totalVotes);
    } else {
      proposal.currentVotesAgainst = proposal.currentVotesAgainst.plus(totalVotes);
    }

    let newVoters = pushUnique<Bytes>(proposal.voters, [voter.id]);

    if (proposal.voters.length < newVoters.length) {
      proposal.voters = newVoters;
      proposal.votersVoted = proposal.votersVoted.plus(BigInt.fromI32(1));

      voter.totalVotedProposals = voter.totalVotedProposals.plus(BigInt.fromI32(1));
    }

    voterInPool.proposals = pushUnique(voterInPool.proposals, [voterInProposal.id]);
    voterInPool.engagedProposalsCount = BigInt.fromI32(voterInPool.proposals.length);

    voter.totalVotes = voter.totalVotes.plus(totalVotes);
  }

  voterInProposal.isVoteFor = event.params.isVoteFor;
  voterInProposal.personalVote = event.params.votes.personal;
  voterInProposal.micropoolVote = event.params.votes.micropool;
  voterInProposal.treasuryVote = event.params.votes.treasury;

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
    // let voterOffchain = getVoterOffchain(voter, pool);
    // voterOffchain.claimedRewardUSD = voterOffchain.claimedRewardUSD.plus(usdAmount);
    // voterOffchain.save();
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

    switch (rewardType) {
      case RewardType.VOTE_FOR:
      case RewardType.VOTE_AGAINST: {
        voterInProposal.personalRewardUSD = voterInProposal.personalRewardUSD.plus(usdAmount);
        break;
      }
      case RewardType.VOTE_FOR_DELEGATED:
      case RewardType.VOTE_AGAINST_DELEGATED: {
        voterInProposal.micropoolRewardUSD = voterInProposal.micropoolRewardUSD.plus(usdAmount);
        break;
      }
      case RewardType.VOTE_FOR_TREASURY:
      case RewardType.VOTE_AGAINST_TREASURY: {
        voterInProposal.treasuryRewardUSD = voterInProposal.treasuryRewardUSD.plus(usdAmount);
        break;
      }
      default: {
        voterInProposal.staticRewardUSD = voterInProposal.staticRewardUSD.plus(usdAmount);
      }
    }

    voterInPool.rewardedUSD = voterInPool.rewardedUSD.plus(usdAmount);

    voterInPool.proposals = pushUnique(voterInPool.proposals, [voterInProposal.id]);
    voterInPool.engagedProposalsCount = BigInt.fromI32(voterInPool.proposals.length);

    voterInProposal.save();
  } else {
    // let voterOffchain = getVoterOffchain(voter, pool);
    // voterOffchain.rewardUSD = voterOffchain.rewardUSD.plus(usdAmount);
    // voterOffchain.save();
  }

  voter.totalRewardedUSD = voter.totalRewardedUSD.plus(usdAmount);

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
  voterInPool.totalLockedUSD = voterInPool.totalLockedUSD.plus(usdAmount);

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

  if (usdAmount.gt(voterInPool.totalLockedUSD)) {
    voterInPool.totalLockedUSD = BigInt.zero();
  } else {
    voterInPool.totalLockedUSD = voterInPool.totalLockedUSD.minus(usdAmount);
  }

  voterInPool.save();
  voter.save();
  pool.save();
}

export function onMicropoolRewardClaimed(event: MicropoolRewardClaimed): void {
  let pool = getDaoPool(event.address);
  let voter = getVoter(event.params.user);
  let voterInPool = getVoterInPool(pool, voter, event.block.timestamp);

  const usdAmount = getUSDValue(event.params.token, event.params.amount);
  voter.totalClaimedUSD = voter.totalClaimedUSD.plus(usdAmount);

  // voterInPool.totalStakingReward = voterInPool.totalStakingReward.plus(usdAmount);

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
  if (voterInPool.totalLockedUSD.notEqual(BigInt.zero()) && currentTimestamp.notEqual(voterInPool.joinedTimestamp)) {
    let RLRatio = rewardCredited.times(BigInt.fromI32(PERCENTAGE_NUMERATOR)).div(voterInPool.totalLockedUSD);
    let numerator = voterInPool._cusum
      .times(voterInPool._lastUpdate.minus(voterInPool.joinedTimestamp))
      .plus(RLRatio.times(currentTimestamp.minus(voterInPool.joinedTimestamp)));
    let denominator = currentTimestamp.minus(voterInPool.joinedTimestamp);
    let P = numerator.div(denominator);

    voterInPool.APR = P.times(YEAR).div(currentTimestamp.minus(voterInPool.joinedTimestamp));
    voterInPool._cusum = P;
    voterInPool._lastUpdate = currentTimestamp;
  }
}

function isZero(val: BigInt): boolean {
  return val.equals(BigInt.zero());
}
