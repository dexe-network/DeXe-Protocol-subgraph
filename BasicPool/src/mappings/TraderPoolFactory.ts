import { Deployed } from "../../generated/TraderPoolFactory/TraderPoolFactory";
import { getBasicTraderPool } from "../entities/basic-pool/BasicTraderPool";
import { BASIC_POOL_NAME } from "../entities/global/globals";
import { BasicPool, RiskyProposal } from "../../generated/templates";

export function onDeployed(event: Deployed): void {
  if (event.params.poolType == BASIC_POOL_NAME) {
    let pool = getBasicTraderPool(
      event.params.at,
      event.params.basicToken,
      event.params.symbol,
      event.params.name,
      event.params.descriptionURL,
      event.block.timestamp
    );
    pool.save();

    BasicPool.create(event.params.at);
    RiskyProposal.create(event.params.proposalContract);
  }
}
