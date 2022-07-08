import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { Transaction } from "../../generated/schema";
import {
  CommissionClaimed,
  DescriptionURLChanged,
  Divested,
  Exchanged,
  Invested,
  ModifiedAdmins,
  ModifiedPrivateInvestors,
  ProposalDivested,
} from "../../generated/templates/TraderPool/TraderPool";
import { getExchange } from "../entities/trader-pool/Exchange";
import { getTransaction } from "../entities/transaction/Transaction";
import { getVest } from "../entities/trader-pool/Vest";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getOnlyPool } from "../entities/transaction/OnlyPool";
import { getRiskyProposalVest } from "../entities/trader-pool/risky-proposal/RiskyProposalVest";
import { getGetPerfomaneFee } from "../entities/transaction/GetPerfomanceFee";

export function onExchange(event: Exchanged): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );
  let exchange = getExchange(
    event.transaction.hash,
    event.address,
    event.params.fromToken,
    event.params.toToken,
    event.params.fromVolume,
    event.params.toVolume
  );

  transaction.type = getEnumBigInt(TransactionType.SWAP);
  exchange.transaction = transaction.id;

  transaction.save();
  exchange.save();
}

export function onInvest(event: Invested): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );
  setupVest(
    transaction,
    event.params.investedBase,
    event.params.receivedLP,
    event.transaction.hash,
    getEnumBigInt(TransactionType.INVEST)
  );
}

export function onDivest(event: Divested): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );
  setupVest(
    transaction,
    event.params.receivedBase,
    event.params.divestedLP,
    event.transaction.hash,
    getEnumBigInt(TransactionType.DIVEST)
  );
}

export function onDescriptionURLChanged(event: DescriptionURLChanged): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  let onlyPool = getOnlyPool(event.transaction.hash, event.address);

  onlyPool.transaction = transaction.id;
  transaction.type = getEnumBigInt(TransactionType.POOL_EDIT);

  transaction.save();
  onlyPool.save();
}

export function onProposalDivest(event: ProposalDivested): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );

  let proposalVest = getRiskyProposalVest(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    event.params.receivedBase,
    event.params.divestedLP2
  );
  proposalVest.transaction = transaction.id;
  transaction.type = getEnumBigInt(TransactionType.RISKY_PROPOSAL_DIVEST);

  proposalVest.save();
  transaction.save();
}

export function onModifiedPrivateInvestors(event: ModifiedPrivateInvestors): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  let onlyPool = getOnlyPool(event.transaction.hash, event.address);

  onlyPool.transaction = transaction.id;
  transaction.type = getEnumBigInt(TransactionType.POOL_UPDATE_INVESTORS);

  transaction.save();
  onlyPool.save();
}

export function onModifiedAdmins(event: ModifiedAdmins): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  let onlyPool = getOnlyPool(event.transaction.hash, event.address);

  onlyPool.transaction = transaction.id;
  transaction.type = getEnumBigInt(TransactionType.POOL_UPDATE_MANAGERS);

  transaction.save();
  onlyPool.save();
}

export function onCommissionClaimed(event: CommissionClaimed): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  let perfomanceFee = getGetPerfomaneFee(
    event.transaction.hash,
    event.params.traderBaseClaimed,
    event.params.traderLpClaimed
  );

  perfomanceFee.transaction = transaction.id;
  transaction.type = getEnumBigInt(TransactionType.TRADER_GET_PERFOMANCE_FEE);

  transaction.save();
  perfomanceFee.save();
}

function setupVest(transaction: Transaction, baseAmount: BigInt, lpAmount: BigInt, hash: Bytes, type: BigInt): void {
  let vest = getVest(hash, baseAmount, lpAmount);

  transaction.type = type;
  vest.transaction = transaction.id;

  transaction.save();
  vest.save();
}
