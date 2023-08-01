import { BigInt } from "@graphprotocol/graph-ts";
import {
  Voted,
  InternalProposalCreated,
  InternalProposalExecuted,
} from "../../generated/templates/DaoValidators/DaoValidators";
import { getDaoValidatorProposalVote } from "../entities/dao-pool/DaoValidatorProposalVote";
import { getDaoValidatorProposalCreate } from "../entities/dao-pool/DaoValidatorProposalCreate";
import { getDaoValidatorProposalExecute } from "../entities/dao-pool/DaoValidatorProposalExecute";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getTransaction } from "../entities/transaction/Transaction";
import { push } from "../helpers/ArrayHelper";

export function onVoted(event: Voted): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );

  let vote = getDaoValidatorProposalVote(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    event.params.vote,
    transaction.interactionsCount,
    event.params.isVoteFor
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_VALIDATORS_VOTED));
  vote.transaction = transaction.id;

  transaction.save();
  vote.save();
}

export function onInternalProposalCreated(event: InternalProposalCreated): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );

  let created = getDaoValidatorProposalCreate(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    transaction.interactionsCount
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_VALIDATORS_PROPOSAL_CREATED));
  created.transaction = transaction.id;

  transaction.save();
  created.save();
}

export function onInternalProposalExecuted(event: InternalProposalExecuted): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.executor,
    event.address
  );

  let executed = getDaoValidatorProposalExecute(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    transaction.interactionsCount
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_VALIDATORS_PROPOSAL_EXECUTED));
  executed.transaction = transaction.id;

  transaction.save();
  executed.save();
}
