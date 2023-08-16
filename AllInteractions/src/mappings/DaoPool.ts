import { BigInt } from "@graphprotocol/graph-ts";
import {
  Delegated,
  Deposited,
  MovedToValidators,
  OffchainResultsSaved,
  ProposalCreated,
  ProposalExecuted,
  RewardClaimed,
  Voted,
  Withdrawn,
  Requested,
  DelegatedTreasury,
} from "../../generated/templates/DaoPool/DaoPool";
import { getDaoPoolDelegate } from "../entities/dao-pool/DaoPoolDelegate";
import { getDaoPoolVest } from "../entities/dao-pool/DaoPoolVest";
import { getDaoPoolMovedToValidators } from "../entities/dao-pool/DaoPoolMovedToValidators";
import { getDaoPoolExecute } from "../entities/dao-pool/DaoPoolProposalExecute";
import { getDaoPoolRewardClaim } from "../entities/dao-pool/DaoPoolRewardClaim";
import { getDaoPoolVote } from "../entities/dao-pool/DaoPoolVote";
import { getDaoProposalCreate } from "../entities/dao-pool/DaoProposalCreate";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getTransaction } from "../entities/transaction/Transaction";
import { getDaoPoolOffchainResult } from "../entities/dao-pool/DaoOffchainResults";
import { push } from "../helpers/ArrayHelper";

export function onProposalCreated(event: ProposalCreated): void {
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

export function onRequested(event: Requested): void {
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
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_POOL_REQUESTED));
  delegated.transaction = transaction.id;

  transaction.save();
  delegated.save();
}

export function onVoted(event: Voted): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );
  let voted = getDaoPoolVote(
    event.transaction.hash,
    event.address,
    getEnumBigInt(event.params.voteType),
    event.params.amount,
    transaction.interactionsCount,
    event.params.isVoteFor
  );
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_POOL_PROPOSAL_VOTED));
  voted.transaction = transaction.id;

  transaction.save();
  voted.save();
}

export function onProposalExecuted(event: ProposalExecuted): void {
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

export function onDeposited(event: Deposited): void {
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
