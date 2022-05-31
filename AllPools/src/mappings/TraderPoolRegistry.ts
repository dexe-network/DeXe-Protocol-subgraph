import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { getTraderPoolPriceHistory } from "../entities/trader-pool/TraderPoolPriceHistory";
import { TraderPoolRegistry } from "../../generated/TraderPoolRegistry/TraderPoolRegistry";
import {
  BASIC_POOL_NAME,
  CHECK_PER_BLOCK,
  POOL_OFFSET,
  POOL_REGISTRY_ADDRESS,
  INVEST_POOL_NAME,
} from "../entities/global/globals";

function updatePools(block: ethereum.Block, type: string): void {
  let tprPrototype = TraderPoolRegistry.bind(Address.fromString(POOL_REGISTRY_ADDRESS));
  let poolCount = tprPrototype.try_countPools(type);

  if (poolCount.reverted) return;

  let iters = Math.ceil(F64.parseFloat(poolCount.value.toI64().toString()) / POOL_OFFSET);

  for (let i = 0; i < iters; i++) {
    let poolInfo = tprPrototype.try_listPoolsWithInfo(
      type,
      BigInt.fromI32(POOL_OFFSET * i),
      BigInt.fromI32((i + 1) * POOL_OFFSET)
    );

    if (!poolInfo.reverted) {
      for (let pool = 0; pool < poolInfo.value.value0.length; pool++) {
        let traderPool = getTraderPool(poolInfo.value.value0[pool]);
        let history = getTraderPoolPriceHistory(
          traderPool,
          block.number,
          block.timestamp,
          poolInfo.value.value1[pool].totalPoolUSD,
          poolInfo.value.value1[pool].totalPoolBase,
          poolInfo.value.value1[pool].lpSupply,
          poolInfo.value.value1[pool].traderUSD,
          poolInfo.value.value1[pool].traderBase
        );

        history.save();

        let prevHistory = getTraderPoolPriceHistory(traderPool, block.number.minus(BigInt.fromI32(CHECK_PER_BLOCK)));
        prevHistory.isLast = false;
        prevHistory.save();

        traderPool.priceHistoryCount = traderPool.priceHistoryCount.plus(BigInt.fromI32(1));
        traderPool.save();
      }
    }
  }
}

export function handl(block: ethereum.Block): void {
  if (block.number.mod(BigInt.fromU64(CHECK_PER_BLOCK)).equals(BigInt.zero())) {
    updatePools(block, BASIC_POOL_NAME);
    updatePools(block, INVEST_POOL_NAME);
  }
}
