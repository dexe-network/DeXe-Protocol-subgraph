import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BasicPool } from "../../../generated/schema";

export function getBasicTraderPool(
  poolAddress: Address,
  basicTokenAddress: Address = Address.zero(),
  ticker: string = "",
  name: string = "",
  creatingTime: BigInt = BigInt.zero()
): BasicPool {
  let basicPool = BasicPool.load(poolAddress.toHex());

  if (basicPool == null) {
    basicPool = new BasicPool(poolAddress.toHex());
    basicPool.baseToken = basicTokenAddress;
    basicPool.investors = new Array<string>();
    basicPool.ticker = ticker;
    basicPool.name = name;
    basicPool.creatingTime = creatingTime;
  }

  return basicPool;
}
