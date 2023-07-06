import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolVest } from "../../../generated/schema";

export function getDaoPoolVest(
  hash: Bytes,
  pool: Address,
  amount: BigInt,
  nfts: Array<BigInt>,
  count: BigInt
): DaoPoolVest {
  let id = hash.concatI32(count.toI32());
  let daoPoolVest = DaoPoolVest.load(id);

  if (daoPoolVest == null) {
    daoPoolVest = new DaoPoolVest(id);
    daoPoolVest.pool = pool;
    daoPoolVest.amount = amount;
    daoPoolVest.nfts = nfts;

    daoPoolVest.transaction = Bytes.empty();
  }

  return daoPoolVest;
}
