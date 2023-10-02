import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolTreasuryDelegate } from "../../../generated/schema";

export function getDaoPoolTreasuryDelegate(
  hash: Bytes,
  pool: Address,
  amount: BigInt,
  count: BigInt
): DaoPoolTreasuryDelegate {
  let id = hash.concatI32(count.toI32());
  let daoPoolDelegate = DaoPoolTreasuryDelegate.load(id);

  if (daoPoolDelegate == null) {
    daoPoolDelegate = new DaoPoolTreasuryDelegate(id);
    daoPoolDelegate.pool = pool;
    daoPoolDelegate.amount = amount;

    daoPoolDelegate.transaction = Bytes.empty();
  }

  return daoPoolDelegate;
}
