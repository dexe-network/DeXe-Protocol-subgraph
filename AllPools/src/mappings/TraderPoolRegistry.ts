import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
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

export function handl(block: ethereum.Block): void {
  if (block.number.mod(BigInt.fromU64(CHECK_PER_BLOCK)).equals(BigInt.fromI32(0))) {
    let tprPrototype = TraderPoolRegistry.bind(Address.fromString(POOL_REGISTRY_ADDRESS));
    let poolCount = tprPrototype.try_countPools(BASIC_POOL_NAME);

    if (poolCount.reverted) return;

    let iters = Math.ceil(F64.parseFloat(poolCount.value.toI64().toString()) / POOL_OFFSET);

    for (let i = 0; i < iters; i++) {
      let poolInfo = tprPrototype.try_listPoolsWithInfo(
        BASIC_POOL_NAME,
        BigInt.fromI32(POOL_OFFSET * i),
        BigInt.fromI32((i + 1) * POOL_OFFSET)
      );

      if (!poolInfo.reverted) {
        for (let pool = 0; pool < poolInfo.value.value0.length; pool++) {
          let basicPool = getTraderPool(poolInfo.value.value0[pool]);
          let history = getTraderPoolPriceHistory(
            basicPool.id,
            block.number,
            block.timestamp,
            poolInfo.value.value1[pool].totalPoolUSD,
            poolInfo.value.value1[pool].totalPoolBase,
            poolInfo.value.value1[pool].lpSupply
          );

          history.save();
        }
      }
    }

    tprPrototype = TraderPoolRegistry.bind(Address.fromString(POOL_REGISTRY_ADDRESS));
    poolCount = tprPrototype.try_countPools(INVEST_POOL_NAME);

    if (poolCount.reverted) return;

    iters = Math.ceil(F64.parseFloat(poolCount.value.toI64().toString()) / POOL_OFFSET);

    for (let i = 0; i < iters; i++) {
      let poolInfo = tprPrototype.try_listPoolsWithInfo(
        INVEST_POOL_NAME,
        BigInt.fromI32(POOL_OFFSET * i),
        BigInt.fromI32((i + 1) * POOL_OFFSET)
      );
      if (!poolInfo.reverted) {
        for (let pool = 0; pool < poolInfo.value.value0.length; pool++) {
          let investPool = getTraderPool(poolInfo.value.value0[pool]);
          let history = getTraderPoolPriceHistory(
            investPool.id,
            block.number,
            block.timestamp,
            poolInfo.value.value1[pool].totalPoolUSD,
            poolInfo.value.value1[pool].totalPoolBase,
            poolInfo.value.value1[pool].lpSupply
          );

          history.save();
        }
      }
    }
  }
}
