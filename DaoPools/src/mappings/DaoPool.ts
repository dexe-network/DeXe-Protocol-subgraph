import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import {
  Delegated,
  DPCreated,
  ProposalCreated,
  ProposalExecuted,
  RewardClaimed,
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
import { Proposal, VoterInProposal } from "../../generated/schema";
import { extendArray, reduceArray } from "../helpers/ArrayHelper";

export function onProposalCreated(event: ProposalCreated): void {
  let pool = getDaoPool(event.address);
  let proposal = getProposal(pool, event.params.proposalId, event.params.sender, event.params.quorum);

  if (proposal.creator != event.params.sender) {
    proposal.creator = event.params.sender;
    proposal.quorum = event.params.quorum;
  }

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
  let voterInPool = getVoterInPool(pool, to);

  if (event.params.isDelegate) {
    voterInPool.receivedDelegation = voterInPool.receivedDelegation.plus(event.params.amount);
    voterInPool.receivedNFTDelegation = extendArray<BigInt>(voterInPool.receivedNFTDelegation, event.params.nfts);
  } else {
    voterInPool.receivedDelegation = voterInPool.receivedDelegation.minus(event.params.amount);
    voterInPool.receivedNFTDelegation = reduceArray<BigInt>(voterInPool.receivedNFTDelegation, event.params.nfts);
  }

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
  let proposal: Proposal;
  let voterInProposal: VoterInProposal;

  proposal = getProposal(pool, event.params.proposalId);
  voterInProposal = getVoterInProposal(proposal, voterInPool);

  voterInProposal.claimedReward = event.params.amount;

  voterInProposal.save();

  voterInPool.totalClaimedUSD = voterInPool.totalClaimedUSD.plus(
    getUSDFromPriceFeed(event.params.token, event.params.amount)
  );

  voterInPool.save();
  voter.save();
  pool.save();
}

function getUSDFromPriceFeed(baseTokenAddress: Address, fromBaseVolume: BigInt): BigInt {
  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));
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
