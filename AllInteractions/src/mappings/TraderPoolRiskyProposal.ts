import { Address, BigInt } from "@graphprotocol/graph-ts";
import { pushUnique } from "@dlsl/graph-modules";
import {
  ProposalCreated,
  ProposalExchanged,
  ProposalInvested,
  ProposalDivested,
  ProposalRestrictionsChanged,
} from "../../generated/templates/TraderPoolRiskyProposal/TraderPoolRiskyProposal";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getProposalContract } from "../entities/trader-pool/ProposalContract";
import { getRiskyProposalCreate } from "../entities/trader-pool/risky-proposal/RiskyProposalCreate";
import { getRiskyProposalEdited } from "../entities/trader-pool/risky-proposal/RiskyProposalEdited";
import { getRiskyProposalExchange } from "../entities/trader-pool/risky-proposal/RiskyProposalExchange";
import { getProposalVest } from "../entities/trader-pool/risky-proposal/ProposalVest";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { getTransaction } from "../entities/transaction/Transaction";

export function onProposalCreated(event: ProposalCreated): void {
  let proposalContract = getProposalContract(event.address);

  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    getTraderPool(Address.fromBytes(proposalContract.pool)).trader
  );

  let proposalCreate = getRiskyProposalCreate(
    event.transaction.hash,
    proposalContract.pool,
    event.params.proposalId,
    event.params.token,
    transaction.interactionsCount
  );

  proposalCreate.transaction = transaction.id;
  transaction.type = pushUnique<BigInt>(transaction.type, [getEnumBigInt(TransactionType.RISKY_PROPOSAL_CREATE)]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  proposalCreate.save();
  transaction.save();
}

export function onProposalExchange(event: ProposalExchanged): void {
  let pool = getProposalContract(event.address).pool;
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );
  let exchange = getRiskyProposalExchange(
    event.transaction.hash,
    pool,
    event.params.proposalId,
    event.params.fromToken,
    event.params.toToken,
    event.params.fromVolume,
    event.params.toVolume,
    transaction.interactionsCount
  );

  exchange.transaction = transaction.id;
  transaction.type = pushUnique<BigInt>(transaction.type, [getEnumBigInt(TransactionType.RISKY_PROPOSAL_SWAP)]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  exchange.save();
  transaction.save();
}

export function onProposalInvest(event: ProposalInvested): void {
  let pool = getProposalContract(event.address).pool;

  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );
  let vest = getProposalVest(
    event.transaction.hash,
    pool,
    event.params.proposalId,
    event.params.investedBase,
    event.params.receivedLP2,
    transaction.interactionsCount
  );
  vest.transaction = transaction.id;
  transaction.type = pushUnique<BigInt>(transaction.type, [getEnumBigInt(TransactionType.RISKY_PROPOSAL_INVEST)]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  vest.save();
  transaction.save();
}

export function onProposalDivest(event: ProposalDivested): void {
  let pool = getProposalContract(event.address).pool;

  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );
  let vest = getProposalVest(
    event.transaction.hash,
    pool,
    event.params.proposalId,
    event.params.receivedBase,
    event.params.divestedLP2,
    transaction.interactionsCount
  );

  vest.transaction = transaction.id;
  transaction.type = pushUnique<BigInt>(transaction.type, [getEnumBigInt(TransactionType.RISKY_PROPOSAL_DIVEST)]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  vest.save();
  transaction.save();
}

export function onProposalRestrictionsChanged(event: ProposalRestrictionsChanged): void {
  let pool = getProposalContract(event.address).pool;
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  let edit = getRiskyProposalEdited(
    event.transaction.hash,
    event.params.proposalId,
    pool,
    transaction.interactionsCount
  );

  edit.transaction = transaction.id;
  transaction.type = pushUnique<BigInt>(transaction.type, [getEnumBigInt(TransactionType.RISKY_PROPOSAL_EDIT)]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  edit.save();
  transaction.save();
}
