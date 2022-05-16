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
  trader: Address = Address.zero(),
  fee: BigInt = BigInt.zero()
): TraderPool {
  let traderPool = TraderPool.load(poolAddress.toHexString());

  if (traderPool == null) {
    traderPool = new TraderPool(poolAddress.toHexString());
    traderPool.type = type;
    traderPool.baseToken = basicTokenAddress;
    traderPool.ticker = ticker;
    traderPool.name = name;
    traderPool.creationTime = creationTime;
    traderPool.descriptionURL = descriptionURL;

    traderPool.maxLoss = BigInt.zero();
    traderPool.fee = fee;

    traderPool.totalTrades = BigInt.zero();
    traderPool.totalClosedPositions = BigInt.zero();

    traderPool.averageTrades = BigInt.zero();
    traderPool.averagePositionTime = BigInt.zero();

    traderPool.priceHistoryCount = BigInt.zero();

    traderPool.admins = extendArray<Bytes>(new Array<Bytes>(), [trader]);
    traderPool.trader = trader;
  }

  return traderPool;
}
