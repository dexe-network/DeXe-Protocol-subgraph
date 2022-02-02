import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BasicPool } from "../../../generated/schema";

export function getBasicTraderPool(
  poolAddress: Address,
  basicTokenAddress: Address = Address.zero(),
  ticker: string = "",
  name: string = "",
  creationTime: BigInt = BigInt.zero()
): BasicPool {
  let basicPool = BasicPool.load(poolAddress.toHexString());

  if (basicPool == null) {
    basicPool = new BasicPool(poolAddress.toHexString());
    basicPool.baseToken = basicTokenAddress;
    basicPool.investors = new Array<string>();
    basicPool.ticker = ticker;
    basicPool.name = name;
    basicPool.creationTime = creationTime;
  }

  return basicPool;
}
