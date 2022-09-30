import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TraderPool, TraderPoolPriceHistory } from "../../../generated/schema";
import { findPrevHistory } from "../../helpers/HistorySearcher";
import { BLOCK_PER_YEAR, CHECK_PER_BLOCK, DECIMAL, PERCENTAGE_DENOMINATOR } from "../global/globals";
import { getTraderPool } from "./TraderPool";

export function getTraderPoolPriceHistory(
  pool: TraderPool,
  blockNumber: BigInt,
  timestamp: BigInt = BigInt.zero(),
  usdTVL: BigInt = BigInt.zero(),
  poolBase: BigInt = BigInt.zero(),
  supply: BigInt = BigInt.zero(),
  traderUSD: BigInt = BigInt.zero(),
  traderBase: BigInt = BigInt.zero(),
  aggregationType: BigInt = BigInt.zero()
): TraderPoolPriceHistory {
  let id = pool.id + blockNumber.toString();
  let history = TraderPoolPriceHistory.load(id);
  if (history == null) {
    let currentPrice = supply.equals(BigInt.zero())
      ? BigInt.fromU64(DECIMAL)
      : usdTVL.times(BigInt.fromU64(DECIMAL)).div(supply);

    history = new TraderPoolPriceHistory(id);
    history.pool = pool.id;
    history.usdTVL = usdTVL;
    history.supply = supply;
    history.timestamp = timestamp;
    history.block = blockNumber;
    history.baseTVL = poolBase;

    history.traderUSD = traderUSD;
    history.traderBase = traderBase;

    history.absPNL = currentPrice.minus(BigInt.fromU64(DECIMAL)).times(supply).div(BigInt.fromU64(DECIMAL));
    history.percPNL = currentPrice.minus(BigInt.fromU64(DECIMAL)).div(BigInt.fromU64(PERCENTAGE_DENOMINATOR));
    history.isLast = true;

    history.aggregationType = aggregationType;

    let prevBlock = roundCheckUp(
      BigInt.fromI64(max(blockNumber.minus(BigInt.fromU64(BLOCK_PER_YEAR)).toI64(), pool.creationBlock.toI64()))
    );

    if (prevBlock.notEqual(roundCheckUp(pool.creationBlock))) {
      let lastYearHistory = findPrevHistory<TraderPoolPriceHistory>(
        TraderPoolPriceHistory.load,
        pool.id,
        prevBlock,
        BigInt.fromI32(CHECK_PER_BLOCK),
        pool.creationBlock
      );

      if (lastYearHistory != null) {
        history.APY = history.percPNL.minus(lastYearHistory.percPNL);
      } else {
        history.APY = history.percPNL;
      }
    } else {
      history.APY = history.percPNL;
    }
  }
  return history;
}

export function roundCheckUp(block: BigInt): BigInt {
  let mod = block.mod(BigInt.fromU64(CHECK_PER_BLOCK));
  return block.plus(BigInt.fromU64(CHECK_PER_BLOCK).minus(mod));
}

export function getPrevPriceHistory(currentPH: TraderPoolPriceHistory): TraderPoolPriceHistory | null {
  let pool = getTraderPool(Address.fromString(currentPH.pool));
  let prevHistory = findPrevHistory<TraderPoolPriceHistory>(
    TraderPoolPriceHistory.load,
    currentPH.pool,
    currentPH.block,
    BigInt.fromI32(CHECK_PER_BLOCK),
    pool.creationBlock
  );

  return prevHistory;
}
