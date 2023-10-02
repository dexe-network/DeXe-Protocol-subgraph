import { BigInt } from "@graphprotocol/graph-ts";
import {
  Delegated,
  DelegatedTreasury,
  Deposited,
  MovedToValidators,
  OffchainResultsSaved,
  ProposalCreated,
  ProposalExecuted,
  RewardClaimed,
  VoteChanged,
  VotingRewardClaimed,
  Withdrawn,
} from "../../generated/templates/DaoPool/DaoPool";
import { getDaoPoolDelegate } from "../entities/dao-pool/DaoPoolDelegate";
import { getDaoPoolVest } from "../entities/dao-pool/DaoPoolVest";
import { getDaoPoolMovedToValidators } from "../entities/dao-pool/DaoPoolMovedToValidators";
import { getDaoPoolExecute } from "../entities/dao-pool/DaoPoolProposalExecute";
import { getDaoPoolRewardClaim } from "../entities/dao-pool/DaoPoolRewardClaim";
import { getDaoPoolProposalInteraction } from "../entities/dao-pool/DaoPoolProposalInteraction";
import { getDaoProposalCreate } from "../entities/dao-pool/DaoProposalCreate";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getTransaction } from "../entities/transaction/Transaction";
import { getDaoPoolOffchainResult } from "../entities/dao-pool/DaoOffchainResults";
import { push } from "../helpers/ArrayHelper";
import { getPool } from "../entities/dao-pool/Pool";
import {
  getEnumBigInt as getProposalInteractionBigInt,
  ProposalInteractionType,
} from "../entities/global/ProposalInteractionTypeEnum";
import { getDaoPoolTreasuryDelegate } from "../entities/dao-pool/DaoPoolTreasuryDelegate";
import { getDaoPoolVotingRewardClaim } from "../entities/dao-pool/DaoPoolVotingRewardClaim";

export function onProposalCreated(event: ProposalCreated): void {
  getPool(event.address).save();
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );
  let proposalCreated = getDaoProposalCreate(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    transaction.interactionsCount
  );
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_POOL_PROPOSAL_CREATED));
  proposalCreated.transaction = transaction.id;

  transaction.save();
  proposalCreated.save();
}

export function onDelegated(event: Delegated): void {
  getPool(event.address).save();
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.from,
    event.address
  );
  let delegated = getDaoPoolDelegate(
    event.transaction.hash,
    event.address,
    event.params.amount,
    transaction.interactionsCount
  );
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(
    transaction.type,
    getEnumBigInt(event.params.isDelegate ? TransactionType.DAO_POOL_DELEGATED : TransactionType.DAO_POOL_UNDELEGATED)
  );
  delegated.transaction = transaction.id;

  transaction.save();
  delegated.save();
}

export function onDelegatedTreasury(event: DelegatedTreasury): void {
  getPool(event.address).save();
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.address,
    event.address
  );
  let delegatedTreasury = getDaoPoolTreasuryDelegate(
    event.transaction.hash,
    event.address,
    event.params.amount,
    transaction.interactionsCount
  );
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(
    transaction.type,
    getEnumBigInt(
      event.params.isDelegate
        ? TransactionType.DAO_POOL_DELEGATED_TREASURY
        : TransactionType.DAO_POOL_UNDELEGATED_TREASURY
    )
  );
  delegatedTreasury.transaction = transaction.id;

  transaction.save();
  delegatedTreasury.save();
}

export function onVoteChanged(event: VoteChanged): void {
  getPool(event.address).save();
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.voter,
    event.address
  );

  let txType = TransactionType.DAO_POOL_PROPOSAL_VOTED;
  let interactionType = event.params.isVoteFor
    ? ProposalInteractionType.VOTE_FOR
    : ProposalInteractionType.VOTE_AGAINST;

  if (event.params.totalVoted.equals(BigInt.zero())) {
    txType = TransactionType.DAO_POOL_PROPOSAL_VOTE_CANCELED;
    interactionType = ProposalInteractionType.VOTE_CANCEL;
  }

  let interaction = getDaoPoolProposalInteraction(
    event.transaction.hash,
    event.address,
    getProposalInteractionBigInt(interactionType),
    event.params.totalVoted,
    transaction.interactionsCount
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(txType));
  interaction.transaction = transaction.id;

  transaction.save();
  interaction.save();
}

export function onProposalExecuted(event: ProposalExecuted): void {
  getPool(event.address).save();
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );
  let executed = getDaoPoolExecute(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    transaction.interactionsCount
  );
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_POOL_PROPOSAL_EXECUTED));
  executed.transaction = transaction.id;

  transaction.save();
  executed.save();
}

export function onRewardClaimed(event: RewardClaimed): void {
  getPool(event.address).save();
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );
  let claimed = getDaoPoolRewardClaim(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    transaction.interactionsCount
  );
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_POOL_REWARD_CLAIMED));
  claimed.transaction = transaction.id;

  transaction.save();
  claimed.save();
}

export function onVotingRewardClaimed(event: VotingRewardClaimed): void {
  getPool(event.address).save();
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );
  let claimed = getDaoPoolVotingRewardClaim(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    transaction.interactionsCount
  );
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_POOL_VOTING_REWARD_CLAIMED));
  claimed.transaction = transaction.id;

  transaction.save();
  claimed.save();
}

export function onDeposited(event: Deposited): void {
  getPool(event.address).save();
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );

  let deposit = getDaoPoolVest(
    event.transaction.hash,
    event.address,
    event.params.amount,
    event.params.nfts,
    transaction.interactionsCount
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_POOL_DEPOSITED));
  deposit.transaction = transaction.id;

  transaction.save();
  deposit.save();
}

export function onWithdrawn(event: Withdrawn): void {
  getPool(event.address).save();
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );

  let withdrawn = getDaoPoolVest(
    event.transaction.hash,
    event.address,
    event.params.amount,
    event.params.nfts,
    transaction.interactionsCount
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_POOL_WITHDRAWN));
  withdrawn.transaction = transaction.id;

  transaction.save();
  withdrawn.save();
}

export function onMovedToValidators(event: MovedToValidators): void {
  getPool(event.address).save();
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );

  let moved = getDaoPoolMovedToValidators(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    transaction.interactionsCount
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_POOL_MOVED_TO_VALIDATORS));
  moved.transaction = transaction.id;

  transaction.save();
  moved.save();
}

export function onOffchainResultsSaved(event: OffchainResultsSaved): void {
  getPool(event.address).save();
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );

  let offchainResultsSaved = getDaoPoolOffchainResult(
    event.transaction.hash,
    event.address,
    transaction.interactionsCount
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_POOL_OFFCHAIN_RESULTS_SAVED));
  offchainResultsSaved.transaction = transaction.id;

  transaction.save();
  offchainResultsSaved.save();
}
