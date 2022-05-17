import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { BasicPool } from "../../../generated/schema";

export function getBasicTraderPool(
  poolAddress: Address,
  basicTokenAddress: Address = Address.zero(),
  ticker: string = "",
  name: string = "",
  descriptionURL: string = "",
  creationTime: BigInt = BigInt.zero(),
  commission: BigInt = BigInt.zero()
): BasicPool {
  let basicPool = BasicPool.load(poolAddress.toHexString());

  if (basicPool == null) {
    basicPool = new BasicPool(poolAddress.toHexString());
    basicPool.baseToken = basicTokenAddress;
    basicPool.investors = new Array<Bytes>();
    basicPool.privateInvestors = new Array<Bytes>();
    basicPool.ticker = ticker;
    basicPool.name = name;
    basicPool.creationTime = creationTime;
    basicPool.descriptionURL = descriptionURL;
    basicPool.commission = commission;
  }

  return basicPool;
}
