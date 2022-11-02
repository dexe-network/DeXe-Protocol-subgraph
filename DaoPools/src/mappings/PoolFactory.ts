import { DaoPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
import { DaoPool, DistributionProposal } from "../../generated/templates";
import { getDaoPool } from "../entities/DaoPool";

export function onDeployed(event: DaoPoolDeployed): void {
  getDaoPool(event.params.govPool, event.params.name, event.block.timestamp, event.block.number).save();

  DaoPool.create(event.params.govPool);
  DistributionProposal.create(event.params.DP);
}
