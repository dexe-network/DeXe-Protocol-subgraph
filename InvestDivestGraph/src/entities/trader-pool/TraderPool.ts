import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TraderPool } from "../../../generated/schema";

export function getTraderPool(poolAddress: Address, type: string = ""): TraderPool {
  let traderPool = TraderPool.load(poolAddress.toHexString());

  if (traderPool == null) {
    traderPool = new TraderPool(poolAddress.toHexString());
    traderPool.type = type;
  }

  return traderPool;
}
