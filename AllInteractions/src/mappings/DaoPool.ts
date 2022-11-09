import { BigInt } from "@graphprotocol/graph-ts";
import {
  Delegated,
  ProposalCreated,
  ProposalExecuted,
  RewardClaimed,
  Voted,
} from "../../generated/templates/DaoPool/DaoPool";
import { getDaoPoolDelegate } from "../entities/dao-pool/DaoPoolDelegate";
import { getDaoPoolProposalExecute } from "../entities/dao-pool/DaoPoolProposalExecute";
import { getDaoPoolRewardClaimed } from "../entities/dao-pool/DaoPoolRewardClaimed";
import { getDaoPoolVote } from "../entities/dao-pool/DaoPoolVote";
import { getDaoProposalCreated } from "../entities/dao-pool/DaoProposalCreated";
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
  let proposalCreated = getDaoProposalCreated(
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
  transaction.type = extendArray<BigInt>(transaction.type, [getEnumBigInt(TransactionType.DAO_POOL_DELEGATED)]);
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
  let executed = getDaoPoolProposalExecute(
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
  let claimed = getDaoPoolRewardClaimed(
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
