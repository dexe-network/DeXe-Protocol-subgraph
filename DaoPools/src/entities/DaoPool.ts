import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DaoPool } from "../../generated/schema";

export function getDaoPool(
  poolAddress: Address,
  name: string = "",
  timestamp: BigInt = BigInt.zero(),
  blockNumber: BigInt = BigInt.zero()
): DaoPool {
  let pool = DaoPool.load(poolAddress);

  if (pool == null) {
    pool = new DaoPool(poolAddress);
    pool.name = name;
    pool.votersCount = BigInt.zero();
    pool.creationTime = timestamp;
    pool.creationBlock = blockNumber;
  }

  return pool;
}
