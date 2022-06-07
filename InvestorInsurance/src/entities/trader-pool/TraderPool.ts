import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TraderPool } from "../../../generated/schema";
import { extendArray } from "../../helpers/ArrayHelper";

export function getTraderPool(
  poolAddress: Address,
  type: string = "",
  basicTokenAddress: Address = Address.zero(),
  ticker: string = "",
  name: string = "",
  creationTime: BigInt = BigInt.zero(),
  block: BigInt = BigInt.zero(),
  commission: BigInt = BigInt.zero()
): TraderPool {
  let traderPool = TraderPool.load(poolAddress.toHexString());

  if (traderPool == null) {
    traderPool = new TraderPool(poolAddress.toHexString());
    traderPool.type = type;
    traderPool.baseToken = basicTokenAddress;
    traderPool.ticker = ticker;
    traderPool.name = name;
    traderPool.creationTime = creationTime;
    traderPool.creationBlock = block;
    traderPool.commission = commission;
  }

  return traderPool;
}
