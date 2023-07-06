import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { getPrevPriceHistory, getTraderPoolPriceHistory } from "../entities/trader-pool/TraderPoolPriceHistory";
import { PoolRegistry } from "../../generated/PoolRegistry/PoolRegistry";
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
  BLOCK_PER_5MIN.times(BigInt.fromI32(12)), // 1 h
  BLOCK_PER_5MIN.times(BigInt.fromI32(24)), // 2 h
  BLOCK_PER_5MIN.times(BigInt.fromI32(48)), // 4 h
  BLOCK_PER_5MIN.times(BigInt.fromI32(144)), // 12 h
  BLOCK_PER_5MIN.times(BigInt.fromI32(288)), // 24 h
  BLOCK_PER_5MIN.times(BigInt.fromI32(288)).times(BigInt.fromI32(30)), // 1 m
];

const CODES = [
  0b00000001, // = 1   => 15 min
  0b00000010, // = 2   => 30 min
  0b00000100, // = 4   => 1 h
  0b00001000, // = 8   => 2 h
  0b00010000, // = 16  => 4 h
  0b00100000, // = 32  => 12 h
  0b01000000, // = 64  => 24 h
  0b10000000, // = 128  => 1 m
];

function updatePools(block: ethereum.Block, type: string): void {
  let tprPrototype = PoolRegistry.bind(Address.fromString(POOL_REGISTRY_ADDRESS));
  let poolCount = tprPrototype.try_countPools(type);

  if (poolCount.reverted) {
    log.warning("try_countPools is reverted for type {}, in block {}", [type, block.number.toString()]);
    return;
  }

  let iters = Math.ceil(F64.parseFloat(poolCount.value.toI64().toString()) / POOL_OFFSET);

  for (let i = 0; i < iters; i++) {
    let poolInfo = tprPrototype.try_listTraderPoolsWithInfo(
      type,
      BigInt.fromI32(POOL_OFFSET * i),
      BigInt.fromI32(POOL_OFFSET)
    );

    if (!poolInfo.reverted) {
      for (let j = 0; j < poolInfo.value.value0.length; j++) {
        let aggregationType = 0;
        let traderPool = getTraderPool(poolInfo.value.value0[j]);
        let creationBlock = traderPool.creationBlock.plus(
          block.number.minus(traderPool.creationBlock).mod(BLOCK_PER_5MIN)
        );

        for (let k = 0; k < BLOCK_INTERVALS.length; k++) {
          if (block.number.minus(creationBlock).mod(BLOCK_INTERVALS[k]).equals(BigInt.zero())) {
            aggregationType += CODES[k];
          }
        }

        let history = getTraderPoolPriceHistory(
          traderPool,
          block.number,
          block.timestamp,
          poolInfo.value.value1[j].totalPoolUSD,
          poolInfo.value.value1[j].totalPoolBase,
          poolInfo.value.value1[j].lpSupply,
          poolInfo.value.value1[j].traderUSD,
          poolInfo.value.value1[j].traderBase,
          BigInt.fromI32(aggregationType)
        );

        history.save();

        let prevHistory = getPrevPriceHistory(history);
        if (prevHistory != null) {
          prevHistory.isLast = false;
          prevHistory.save();
        }

        traderPool.priceHistoryCount = traderPool.priceHistoryCount.plus(BigInt.fromI32(1));
        traderPool.save();
      }
    } else {
      log.warning("try_listPoolsWithInfo is reverted for type {}, interval ({} ; {}), in block {}", [
        type,
        BigInt.fromI32(POOL_OFFSET * i).toString(),
        POOL_OFFSET.toString(),
        block.number.toString(),
      ]);
    }
  }
}

export function handleBlock(block: ethereum.Block): void {
  if (block.number.mod(BigInt.fromU64(CHECK_PER_BLOCK)).equals(BigInt.zero())) {
    updatePools(block, BASIC_POOL_NAME);
    updatePools(block, INVEST_POOL_NAME);
  }
}
