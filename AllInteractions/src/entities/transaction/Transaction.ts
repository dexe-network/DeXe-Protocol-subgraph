import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { Transaction } from "../../../generated/schema";

export function getTransaction(hash: Bytes, block: BigInt, timestamp: BigInt, investor: Bytes): Transaction {
  let transaction = Transaction.load(hash);

  if (transaction == null) {
    transaction = new Transaction(hash);
    transaction.block = block;
    transaction.timestamp = timestamp;
    transaction.type = new Array<BigInt>();
    transaction.user = investor;
    transaction.interactionsCount = BigInt.zero();
  }

  return transaction;
}
