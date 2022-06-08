import { TraderPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { TraderPool } from "../../generated/templates";

export function onDeployed(event: TraderPoolDeployed): void {
  let pool = getTraderPool(event.params.at, event.params.poolType, event.block.timestamp, event.block.number);
  pool.save();

  TraderPool.create(event.params.at);
}
