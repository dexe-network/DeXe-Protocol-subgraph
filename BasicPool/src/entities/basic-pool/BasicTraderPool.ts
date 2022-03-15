import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BasicPool } from "../../../generated/schema";

export function getBasicTraderPool(
  poolAddress: Address,
  basicTokenAddress: Address = Address.zero(),
  ticker: string = "",
  name: string = "",
  descriptionURL: string = "",
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
    basicPool.descriptionURL = descriptionURL;

    basicPool.maxLoss = BigInt.zero();

    basicPool.totalTrades = BigInt.zero();
    basicPool.totalClosedPositions = BigInt.zero();

    basicPool.averageTrades = BigInt.zero();
    basicPool.averagePositionTime = BigInt.zero();
  }

  return basicPool;
}
