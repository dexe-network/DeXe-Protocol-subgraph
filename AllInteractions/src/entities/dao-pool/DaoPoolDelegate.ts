import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolDelegate } from "../../../generated/schema";

export function getDaoPoolDelegate(hash: Bytes, pool: Address, amount: BigInt, count: BigInt): DaoPoolDelegate {
  let id = hash.concatI32(count.toI32());
  let daoPoolDelegate = DaoPoolDelegate.load(id);

  if (daoPoolDelegate == null) {
    daoPoolDelegate = new DaoPoolDelegate(id);
    daoPoolDelegate.pool = pool;
    daoPoolDelegate.amount = amount;

    daoPoolDelegate.transaction = Bytes.empty();
  }

  return daoPoolDelegate;
}
