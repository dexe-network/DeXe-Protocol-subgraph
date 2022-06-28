import { TraderPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
import { TraderPool } from "../../generated/templates";

export function onDeployed(event: TraderPoolDeployed): void {
  TraderPool.create(event.params.at);
  event.params.trader;
}
