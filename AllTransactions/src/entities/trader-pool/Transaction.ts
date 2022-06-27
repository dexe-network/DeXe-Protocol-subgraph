import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { Transaction } from "../../../generated/schema";

export function getTransaction(
  hash: Bytes,
  block: BigInt,
  timestamp: BigInt,
  investor: Bytes,
  pool: Bytes
): Transaction {
  let id = hash.toHexString();
  let transaction = Transaction.load(id);

  if (transaction == null) {
    transaction = new Transaction(id);
    transaction.block = block;
    transaction.timestamp = timestamp;
    transaction.type = "";
    transaction.pool = pool;
    transaction.investor = investor;
    transaction.exchange = "";
    transaction.vest = "";
  }

  return transaction;
}
