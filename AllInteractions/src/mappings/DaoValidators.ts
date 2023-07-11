import { BigInt } from "@graphprotocol/graph-ts";
import { pushUnique } from "@dlsl/graph-modules";
import {
  Voted,
  InternalProposalCreated,
  InternalProposalExecuted,
} from "../../generated/templates/DaoValidators/DaoValidators";
import { getDaoVaildatorProposalVote } from "../entities/dao-pool/DaoValidatorProposalVote";
import { getDaoValidatorProposalCreate } from "../entities/dao-pool/DaoValidatorProposalCreate";
import { getDaoValidatorProposalExecute } from "../entities/dao-pool/DaoValidatorProposalExecute";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getTransaction } from "../entities/transaction/Transaction";

export function onVoted(event: Voted): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  let voted = getDaoVaildatorProposalVote(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    event.params.vote,
    transaction.interactionsCount,
    event.params.isVoteFor
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = pushUnique<BigInt>(transaction.type, [getEnumBigInt(TransactionType.DAO_VALIDATORS_VOTED)]);
  voted.transaction = transaction.id;

  transaction.save();
  voted.save();
}

export function onInternalProposalCreated(event: InternalProposalCreated): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  let created = getDaoValidatorProposalCreate(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    transaction.interactionsCount
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = pushUnique<BigInt>(transaction.type, [
    getEnumBigInt(TransactionType.DAO_VALIDATORS_PROPOSAL_CREATED),
  ]);
  created.transaction = transaction.id;

  transaction.save();
  created.save();
}

export function onInternalProposalExecuted(event: InternalProposalExecuted): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.executor
  );

  let executed = getDaoValidatorProposalExecute(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    transaction.interactionsCount
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = pushUnique<BigInt>(transaction.type, [
    getEnumBigInt(TransactionType.DAO_VALIDATORS_PROPOSAL_EXECUTED),
  ]);
  executed.transaction = transaction.id;

  transaction.save();
  executed.save();
}
