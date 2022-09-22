import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DaoPool } from "../../generated/schema";

export function getDaoPool(poolAddress: Address): DaoPool {
  let pool = DaoPool.load(poolAddress);

  if (pool == null) {
    pool = new DaoPool(poolAddress);
    pool.votersCount = BigInt.zero();
  }

  return pool;
}
