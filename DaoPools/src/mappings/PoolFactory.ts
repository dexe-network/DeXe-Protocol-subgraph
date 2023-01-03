import { DaoPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
import { DaoPool, DaoSettings, DistributionProposal, UserKeeper } from "../../generated/templates";
import { getDaoPool } from "../entities/DaoPool";
import { getDPContract } from "../entities/DPContract";
import { getSettingsContract } from "../entities/SettingsContract";
import { getUserKeeperContract } from "../entities/UserKeeperContract";

export function onDeployed(event: DaoPoolDeployed): void {
  getDaoPool(event.params.govPool, event.params.name, event.block.timestamp, event.block.number).save();

  getDPContract(event.params.DP, event.params.govPool).save();
  getSettingsContract(event.params.settings, event.params.govPool).save();
  getUserKeeperContract(event.params.govUserKeeper, event.params.govPool).save();

  DaoPool.create(event.params.govPool);
  DistributionProposal.create(event.params.DP);
  DaoSettings.create(event.params.settings);
  UserKeeper.create(event.params.govUserKeeper);
}
