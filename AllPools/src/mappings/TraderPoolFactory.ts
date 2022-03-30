import { Deployed } from "../../generated/TraderPoolFactory/TraderPoolFactory";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { BASIC_POOL_NAME } from "../entities/global/globals";
import { TraderPool } from "../../generated/templates";

export function onDeployed(event: Deployed): void {
  if (event.params.poolName == BASIC_POOL_NAME) {
    let pool = getTraderPool(
      event.params.at,
      event.params.basicToken,
      event.params.symbol,
      event.params.name,
      event.params.descriptionURL,
      event.block.timestamp
    );
    pool.save();

    TraderPool.create(event.params.at);
  }
}
