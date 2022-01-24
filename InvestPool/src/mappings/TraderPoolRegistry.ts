import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { getInvestTraderPool } from "../entities/invest-pool/InvestTraderPool";
import { TraderPoolRegistry } from "../../generated/TraderPoolRegistry/TraderPoolRegistry";
import { getInvestPoolPriceHistory } from "../entities/invest-pool/InvestPoolPriceHistory";
import { INVEST_POOL_NAME, POOL_OFFSET, POOL_REGISTRY_ADDRESS } from "../entities/global/globals";

export function handl(block: ethereum.Block): void {
  if (block.number.mod(BigInt.fromU64(100)).equals(BigInt.fromI32(0))) {
    let tprPrototype = TraderPoolRegistry.bind(Address.fromString(POOL_REGISTRY_ADDRESS));
    let poolCount = tprPrototype.countPools(INVEST_POOL_NAME);
    let iters = Math.ceil(F64.parseFloat(poolCount.toI64().toString()) / POOL_OFFSET);

    for (let i = 0; i < iters; i++) {
      let poolInfo = tprPrototype.listPoolsWithInfo(
        INVEST_POOL_NAME,
        BigInt.fromI32(POOL_OFFSET * i),
        BigInt.fromI32((i + 1) * POOL_OFFSET)
      );

      for (let pool = 0; pool < poolInfo.value0.length; pool++) {
        let investPool = getInvestTraderPool(poolInfo.value0[pool]);
        let history = getInvestPoolPriceHistory(
          block.timestamp,
          investPool.id,
          poolInfo.value1[pool].totalPoolUSD,
          poolInfo.value1[pool].lpEmission,
          poolInfo.value1[pool].totalPoolBase
        );
        history.save();
      }
    }
  }
}
