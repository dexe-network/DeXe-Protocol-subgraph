import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DaoPool } from "../../generated/schema";

export function getDaoPool(poolAddress: Address, timestamp: BigInt, blockNumber: BigInt): DaoPool {
  let pool = DaoPool.load(poolAddress);

  if (pool == null) {
    pool = new DaoPool(poolAddress);
    pool.votersCount = BigInt.zero();
    pool.creationTime = timestamp;
    pool.creationBlock = blockNumber;
  }

  return pool;
}
