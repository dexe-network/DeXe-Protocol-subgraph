import { DaoPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
import { DaoValidators } from "../../generated/templates";
import { getDaoPool } from "../entities/DaoPool";
import { getValidatorContract } from "../entities/ValidatorContract";

export function onDeployed(event: DaoPoolDeployed): void {
  getDaoPool(event.params.govPool).save();
  getValidatorContract(event.params.govPoolDeps.validatorsAddress, event.params.govPool).save();
  DaoValidators.create(event.params.govPoolDeps.validatorsAddress);
}
