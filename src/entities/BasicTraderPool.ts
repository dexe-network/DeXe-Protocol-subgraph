import { Address } from "@graphprotocol/graph-ts";

import { BasicTraderPool } from "../../generated/schema";

export function getBasicTraderPool(
  poolAddress: Address,
  basicTokenAddress: Address | null = null
): BasicTraderPool {
  let basicPool = BasicTraderPool.load(poolAddress.toHex());

  if (basicPool == null) {
    basicPool = new BasicTraderPool(poolAddress.toHex());

    if (basicTokenAddress != null) { 
        basicPool.baseToken = basicTokenAddress.toHex();
    }
  }

  return basicPool;
}
