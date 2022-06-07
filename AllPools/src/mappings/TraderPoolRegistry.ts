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

const BLOCK_PER_5MIN = BigInt.fromI32(CHECK_PER_BLOCK);

const BLOCK_INTERVALS = [
  BLOCK_PER_5MIN.times(BigInt.fromI32(3)), // 15 min
  BLOCK_PER_5MIN.times(BigInt.fromI32(6)), // 30 min
  BLOCK_PER_5MIN.times(BigInt.fromI32(9)), // 45 min
  BLOCK_PER_5MIN.times(BigInt.fromI32(12)), // 1 h
  BLOCK_PER_5MIN.times(BigInt.fromI32(24)), // 2 h
  BLOCK_PER_5MIN.times(BigInt.fromI32(48)), // 4 h
  BLOCK_PER_5MIN.times(BigInt.fromI32(72)), // 6 h
  BLOCK_PER_5MIN.times(BigInt.fromI32(144)), // 12 h
  BLOCK_PER_5MIN.times(BigInt.fromI32(288)), // 24 h
  BLOCK_PER_5MIN.times(BigInt.fromI32(288)).times(BigInt.fromI32(30)), // 1 m
];

const CODES = [
  0b0000000001, // = 1   => 15 min
  0b0000000010, // = 2   => 30 min
  0b0000000100, // = 4   => 45 min
  0b0000001000, // = 8   => 1 h
  0b0000010000, // = 16  => 2 h
  0b0000100000, // = 32  => 4 h
  0b0001000000, // = 64  => 6 h
  0b0010000000, // = 128 => 12 h
  0b0100000000, // = 256 => 24 h
  0b1000000000, // = 512 => 1 m
];

function updatePools(block: ethereum.Block, type: string): void {
  let aggregationType = 0;
  let tprPrototype = TraderPoolRegistry.bind(Address.fromString(POOL_REGISTRY_ADDRESS));
  let poolCount = tprPrototype.try_countPools(type);

  if (poolCount.reverted) {
    log.warning("try_countPools is reverted for type {}, in block {}", [type, block.number.toString()]);
    return;
  }

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

        for (let i = 0; i < BLOCK_INTERVALS.length; i++) {
          if (block.number.minus(traderPool.creationBlock).mod(BLOCK_INTERVALS[i]).equals(BigInt.zero())) {
            aggregationType += CODES[i];
          }
        }

        let history = getTraderPoolPriceHistory(
          traderPool,
          block.number,
          block.timestamp,
          poolInfo.value.value1[pool].totalPoolUSD,
          poolInfo.value.value1[pool].totalPoolBase,
          poolInfo.value.value1[pool].lpSupply,
          poolInfo.value.value1[pool].traderUSD,
          poolInfo.value.value1[pool].traderBase,
          BigInt.fromI32(aggregationType)
        );

        history.save();

        let prevHistory = getTraderPoolPriceHistory(traderPool, block.number.minus(BigInt.fromI32(CHECK_PER_BLOCK)));
        prevHistory.isLast = false;
        prevHistory.save();

        traderPool.priceHistoryCount = traderPool.priceHistoryCount.plus(BigInt.fromI32(1));
        traderPool.save();
      }
    } else {
      log.warning("try_listPoolsWithInfo is reverted for type {}, interval ({} ; {}), in block {}", [
        type,
        BigInt.fromI32(POOL_OFFSET * i).toString(),
        BigInt.fromI32((i + 1) * POOL_OFFSET).toString(),
        block.number.toString(),
      ]);
    }
  }
}

export function handl(block: ethereum.Block): void {
  if (block.number.mod(BigInt.fromU64(CHECK_PER_BLOCK)).equals(BigInt.zero())) {
    updatePools(block, BASIC_POOL_NAME);
    updatePools(block, INVEST_POOL_NAME);
  }
}
