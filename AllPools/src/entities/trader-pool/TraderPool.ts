import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TraderPool } from "../../../generated/schema";
import { extendArray } from "../../helpers/ArrayHelper";

export function getTraderPool(
  poolAddress: Address,
  type: string = "",
  basicTokenAddress: Address = Address.zero(),
  ticker: string = "",
  name: string = "",
  descriptionURL: string = "",
  creationTime: BigInt = BigInt.zero(),
  block: BigInt = BigInt.zero(),
  trader: Address = Address.zero(),
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
    traderPool.block = block;
    traderPool.descriptionURL = descriptionURL;

    traderPool.maxLoss = BigInt.zero();

    traderPool.totalTrades = BigInt.zero();
    traderPool.totalClosedPositions = BigInt.zero();

    traderPool.averageTrades = BigInt.zero();
    traderPool.averagePositionTime = BigInt.zero();

    traderPool.priceHistoryCount = BigInt.zero();

    traderPool.admins = extendArray<Bytes>(new Array<Bytes>(), [trader]);
    traderPool.trader = trader;

    traderPool.commission = commission;
  }

  return traderPool;
}
