import { BigInt } from "@graphprotocol/graph-ts";
import { TraderPool, TraderPoolPriceHistory } from "../../../generated/schema";
import { BLOCK_PER_YEAR, CHECK_PER_BLOCK, DECIMAL, PERCENTAGE } from "../global/globals";

export function getTraderPoolPriceHistory(
  pool: TraderPool,
  blockNumber: BigInt,
  timestamp: BigInt = BigInt.zero(),
  usdTVL: BigInt = BigInt.zero(),
  poolBase: BigInt = BigInt.zero(),
  supply: BigInt = BigInt.zero()
): TraderPoolPriceHistory {
  let id = pool.id + blockNumber.toString();
  let history = TraderPoolPriceHistory.load(id);
  if (history == null) {
    let currentPrice = supply.equals(BigInt.zero()) ? BigInt.fromU64(DECIMAL) : usdTVL.div(supply);

    history = new TraderPoolPriceHistory(id);
    history.pool = pool.id;
    history.usdTVL = usdTVL;
    history.supply = supply;
    history.seconds = timestamp;
    history.baseTVL = poolBase;
    history.absPNL = currentPrice.minus(BigInt.fromU64(DECIMAL)).times(supply).div(BigInt.fromU64(DECIMAL));
    history.percPNL = currentPrice.minus(BigInt.fromU64(DECIMAL)).div(BigInt.fromU64(PERCENTAGE));
    history.isLast = true;

    let prevBlock: BigInt;

    if (blockNumber.minus(pool.block).gt(BigInt.fromU64(BLOCK_PER_YEAR))) {
      prevBlock = roundTo100(blockNumber.minus(BigInt.fromU64(BLOCK_PER_YEAR)));
    } else {
      prevBlock = roundTo100(pool.block);
    }

    history.APY = currentPrice
      .minus(BigInt.fromU64(DECIMAL))
      .div(BigInt.fromU64(PERCENTAGE))
      .minus(getTraderPoolPriceHistory(pool, prevBlock).percPNL);
  }
  return history;
}

function roundTo100(block: BigInt): BigInt {
  let mod = block.mod(BigInt.fromU64(CHECK_PER_BLOCK));
  return block.plus(BigInt.fromU64(CHECK_PER_BLOCK).minus(mod));
}
