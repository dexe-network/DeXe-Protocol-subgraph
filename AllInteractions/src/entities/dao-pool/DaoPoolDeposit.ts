import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolDeposit } from "../../../generated/schema";

export function getDaoPoolDeposit(
  hash: Bytes,
  pool: Address,
  amount: BigInt,
  nfts: Array<BigInt>,
  count: BigInt
): DaoPoolDeposit {
  let id = hash.concatI32(count.toI32());
  let daoPoolDeposit = DaoPoolDeposit.load(id);

  if (daoPoolDeposit == null) {
    daoPoolDeposit = new DaoPoolDeposit(id);
    daoPoolDeposit.pool = pool;
    daoPoolDeposit.amount = amount;
    daoPoolDeposit.nfts = nfts;

    daoPoolDeposit.transaction = Bytes.empty();
  }

  return daoPoolDeposit;
}
