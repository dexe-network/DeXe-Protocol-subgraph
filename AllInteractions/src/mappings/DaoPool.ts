import { BigInt } from "@graphprotocol/graph-ts";
import {
  Delegated,
  Deposited,
  MovedToValidators,
  ProposalCreated,
  ProposalExecuted,
  RewardClaimed,
  Voted,
  Withdrawn,
} from "../../generated/templates/DaoPool/DaoPool";
import { getDaoPoolDelegate } from "../entities/dao-pool/DaoPoolDelegate";
import { getDaoPoolDeposit } from "../entities/dao-pool/DaoPoolDeposit";
import { getDaoPoolMovedToValidators } from "../entities/dao-pool/DaoPoolMovedToValidators";
import { getDaoPoolExecute } from "../entities/dao-pool/DaoPoolProposalExecute";
import { getDaoPoolRewardClaim } from "../entities/dao-pool/DaoPoolRewardClaim";
import { getDaoPoolVote } from "../entities/dao-pool/DaoPoolVote";
import { getDaoProposalCreate } from "../entities/dao-pool/DaoProposalCreate";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getTransaction } from "../entities/transaction/Transaction";
import { extendArray } from "../helpers/ArrayHelper";

export function onProposalCreated(event: ProposalCreated): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );
  let proposalCreated = getDaoProposalCreate(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    transaction.interactionsCount
  );
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = extendArray<BigInt>(transaction.type, [getEnumBigInt(TransactionType.DAO_POOL_PROPOSAL_CREATED)]);
  proposalCreated.transaction = transaction.id;

  transaction.save();
  proposalCreated.save();
}

export function onDelegated(event: Delegated): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.from
  );
  let delegated = getDaoPoolDelegate(
    event.transaction.hash,
    event.address,
    event.params.amount,
    transaction.interactionsCount
  );
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = extendArray<BigInt>(transaction.type, [
    getEnumBigInt(event.params.isDelegate ? TransactionType.DAO_POOL_DELEGATED : TransactionType.DAO_POOL_UNDELEGATED),
  ]);
  delegated.transaction = transaction.id;

  transaction.save();
  delegated.save();
}

export function onVoted(event: Voted): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );
  let voted = getDaoPoolVote(
    event.transaction.hash,
    event.address,
    event.params.personalVote.plus(event.params.delegatedVote),
    transaction.interactionsCount
  );
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = extendArray<BigInt>(transaction.type, [getEnumBigInt(TransactionType.DAO_POOL_PROPOSAL_VOTED)]);
  voted.transaction = transaction.id;

  transaction.save();
  voted.save();
}

export function onProposalExecuted(event: ProposalExecuted): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );
  let executed = getDaoPoolExecute(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    transaction.interactionsCount
  );
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = extendArray<BigInt>(transaction.type, [getEnumBigInt(TransactionType.DAO_POOL_PROPOSAL_EXECUTED)]);
  executed.transaction = transaction.id;

  transaction.save();
  executed.save();
}

export function onRewardClaimed(event: RewardClaimed): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );
  let claimed = getDaoPoolRewardClaim(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    transaction.interactionsCount
  );
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = extendArray<BigInt>(transaction.type, [getEnumBigInt(TransactionType.DAO_POOL_REWARD_CLAIMED)]);
  claimed.transaction = transaction.id;

  transaction.save();
  claimed.save();
}

export function onDeposited(event: Deposited): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  let deposit = getDaoPoolDeposit(
    event.transaction.hash,
    event.address,
    event.params.amount,
    event.params.nfts,
    transaction.interactionsCount
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = extendArray<BigInt>(transaction.type, [getEnumBigInt(TransactionType.DAO_POOL_DEPOSITED)]);
  deposit.transaction = transaction.id;

  transaction.save();
  deposit.save();
}

export function onWithdrawn(event: Withdrawn): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  let withdrawn = getDaoPoolDeposit(
    event.transaction.hash,
    event.address,
    event.params.amount,
    event.params.nfts,
    transaction.interactionsCount
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = extendArray<BigInt>(transaction.type, [getEnumBigInt(TransactionType.DAO_POOL_WITHDRAWN)]);
  withdrawn.transaction = transaction.id;

  transaction.save();
  withdrawn.save();
}

export function onMovedToValidators(event: MovedToValidators): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  let moved = getDaoPoolMovedToValidators(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    transaction.interactionsCount
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = extendArray<BigInt>(transaction.type, [
    getEnumBigInt(TransactionType.DAO_POOL_MOVED_TO_VALIDATORS),
  ]);
  moved.transaction = transaction.id;

  transaction.save();
  moved.save();
}
