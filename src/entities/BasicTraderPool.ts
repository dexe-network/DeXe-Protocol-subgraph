import { Address } from "@graphprotocol/graph-ts";
import { BasicPool } from "../../generated/schema"; 

export function getBasicTraderPool(
  poolAddress: Address,
  basicTokenAddress: Address | null = null
): BasicPool {
  let basicPool = BasicPool.load(poolAddress.toHex());

  if (basicPool == null) {
    basicPool = new BasicPool(poolAddress.toHex());

    if (basicTokenAddress != null) { 
      basicPool.baseToken = basicTokenAddress;
    }
  }

  return basicPool;
}
