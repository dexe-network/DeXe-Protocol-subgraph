import { DaoPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
import { DaoPool, DistributionProposal } from "../../generated/templates";
import { getDaoPool } from "../entities/DaoPool";

export function onDeployed(event: DaoPoolDeployed): void {
  getDaoPool(event.params.govPool).save();

  DaoPool.create(event.params.govPool);
  DistributionProposal.create(event.params.DP);
}