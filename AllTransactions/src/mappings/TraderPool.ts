import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { Transaction } from "../../generated/schema";
import { Divested, Exchanged, Invested } from "../../generated/templates/TraderPool/TraderPool";
import { DIVEST, EXCHANGE, INVEST } from "../entities/global/TransactionTypeEnum";
import { getExchange } from "../entities/trader-pool/Exchange";
import { getTransaction } from "../entities/trader-pool/Transaction";
import { getVest } from "../entities/trader-pool/Vest";

export function onExchange(event: Exchanged): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    Bytes.empty(),
    event.address
  );
  let exchange = getExchange(event.transaction.hash, event.params.fromToken, event.params.toToken);

  transaction.exchange = exchange.id;
  transaction.type = EXCHANGE;
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
  setupVest(transaction, event.params.investedBase, event.transaction.hash, INVEST);
}

export function onDivest(event: Divested): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user,
    event.address
  );
  setupVest(transaction, event.params.receivedBase, event.transaction.hash, DIVEST);
}

function setupVest(transaction: Transaction, amount: BigInt, hash: Bytes, type: string): void {
  let vest = getVest(hash, amount);

  transaction.vest = vest.id;
  transaction.type = type;
  vest.transaction = transaction.id;

  transaction.save();
  vest.save();
}
