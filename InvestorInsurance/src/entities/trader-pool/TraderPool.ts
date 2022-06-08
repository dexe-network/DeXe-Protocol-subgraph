import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TraderPool } from "../../../generated/schema";

export function getTraderPool(
  poolAddress: Address,
  type: string = "",
  creationTime: BigInt = BigInt.zero(),
  block: BigInt = BigInt.zero()
): TraderPool {
  let traderPool = TraderPool.load(poolAddress.toHexString());

  if (traderPool == null) {
    traderPool = new TraderPool(poolAddress.toHexString());
    traderPool.type = type;
    traderPool.creationTime = creationTime;
    traderPool.creationBlock = block;
  }

  return traderPool;
}
