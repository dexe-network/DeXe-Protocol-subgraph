import { TraderPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
import { INVEST_POOL_NAME } from "../entities/global/globals";
import { getInvestTraderPool } from "../entities/invest-pool/InvestTraderPool";
import { InvestPool, InvestProposal } from "../../generated/templates";

export function onDeployed(event: TraderPoolDeployed): void {
  if (event.params.poolType == INVEST_POOL_NAME) {
    let pool = getInvestTraderPool(
      event.params.at,
      event.params.basicToken,
      event.params.symbol,
      event.params.name,
      event.params.descriptionURL,
      event.block.timestamp,
      event.params.commission
    );
    pool.save();

    InvestPool.create(event.params.at);
    InvestProposal.create(event.params.proposalContract);
  }
}
