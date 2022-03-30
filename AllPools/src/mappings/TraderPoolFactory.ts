import { Deployed } from "../../generated/TraderPoolFactory/TraderPoolFactory";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { TraderPool } from "../../generated/templates";

export function onDeployed(event: Deployed): void {
  let pool = getTraderPool(
    event.params.at,
    event.params.poolName,
    event.params.basicToken,
    event.params.symbol,
    event.params.name,
    event.params.descriptionURL,
    event.block.timestamp
  );
  pool.save();

  TraderPool.create(event.params.at);
}
