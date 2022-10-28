import { ExecutorChanged, SettingsChanged } from "../../generated/templates/DaoSettings/DaoSettings";
import { getDaoPool } from "../entities/DaoPool";
import { getExecutor } from "../entities/Settings/Executor";
import { getProposalSettings } from "../entities/Settings/ProposalSettings";

export function onSettingsChanged(event: SettingsChanged): void {
  let pool = getDaoPool(event.address);
  let settings = getProposalSettings(pool, event.params.settingsId);

  settings.executorDescription = event.params.description;

  settings.save();
  pool.save();
}

export function onExecutorChanged(event: ExecutorChanged): void {
  let pool = getDaoPool(event.address);
  let settings = getProposalSettings(pool, event.params.settingsId);
  let executor = getExecutor(pool, event.params.executor);

  executor.settings = settings.id;

  executor.save();
  settings.save();
  pool.save();
}
