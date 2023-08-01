import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
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
import { getProposalVest } from "../entities/trader-pool/risky-proposal/ProposalVest";
import { getGetPerformanceFee } from "../entities/transaction/GetPerformanceFee";
import { push } from "../helpers/ArrayHelper";

export function onExchange(event: Exchanged): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );
  let exchange = getExchange(
    event.transaction.hash,
    event.address,
    event.params.fromToken,
    event.params.toToken,
    event.params.fromVolume,
    event.params.toVolume,
    transaction.interactionsCount
  );

  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.SWAP));
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  exchange.transaction = transaction.id;

  transaction.save();
  exchange.save();
}

export function onInvest(event: Invested): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user,
    event.address
  );
  setupVest(
    transaction,
    event.params.investedBase,
    event.params.receivedLP,
    event.transaction.hash,
    getEnumBigInt(TransactionType.INVEST),
    event.address,
    transaction.interactionsCount
  );
}

export function onDivest(event: Divested): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user,
    event.address
  );
  setupVest(
    transaction,
    event.params.receivedBase,
    event.params.divestedLP,
    event.transaction.hash,
    getEnumBigInt(TransactionType.DIVEST),
    event.address,
    transaction.interactionsCount
  );
}

export function onDescriptionURLChanged(event: DescriptionURLChanged): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );

  let onlyPool = getOnlyPool(event.transaction.hash, event.address, transaction.interactionsCount);

  onlyPool.transaction = transaction.id;
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.POOL_EDIT));
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.save();
  onlyPool.save();
}

export function onProposalDivest(event: ProposalDivested): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user,
    event.address
  );

  let proposalVest = getProposalVest(
    event.transaction.hash,
    event.address,
    event.params.proposalId,
    event.params.receivedBase,
    event.params.divestedLP2,
    transaction.interactionsCount
  );
  proposalVest.transaction = transaction.id;
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.RISKY_PROPOSAL_DIVEST));
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  proposalVest.save();
  transaction.save();
}

export function onModifiedPrivateInvestors(event: ModifiedPrivateInvestors): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );

  let onlyPool = getOnlyPool(event.transaction.hash, event.address, transaction.interactionsCount);

  onlyPool.transaction = transaction.id;
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.POOL_UPDATE_INVESTORS));
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.save();
  onlyPool.save();
}

export function onModifiedAdmins(event: ModifiedAdmins): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );

  let onlyPool = getOnlyPool(event.transaction.hash, event.address, transaction.interactionsCount);

  onlyPool.transaction = transaction.id;
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.POOL_UPDATE_MANAGERS));
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.save();
  onlyPool.save();
}

export function onCommissionClaimed(event: CommissionClaimed): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.address
  );

  let perfomanceFee = getGetPerformanceFee(
    event.transaction.hash,
    event.params.traderBaseClaimed,
    event.params.traderLpClaimed,
    transaction.interactionsCount
  );

  perfomanceFee.transaction = transaction.id;
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.TRADER_GET_PERFOMANCE_FEE));
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.save();
  perfomanceFee.save();
}

function setupVest(
  transaction: Transaction,
  baseAmount: BigInt,
  lpAmount: BigInt,
  hash: Bytes,
  type: BigInt,
  pool: Address,
  count: BigInt
): void {
  let vest = getVest(hash, baseAmount, lpAmount, pool, count);

  transaction.type = push<BigInt>(transaction.type, type);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  vest.transaction = transaction.id;

  transaction.save();
  vest.save();
}
