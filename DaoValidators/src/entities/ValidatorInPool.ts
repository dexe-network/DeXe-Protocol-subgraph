import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DaoPool, ValidatorInPool } from "../../generated/schema";

export function getValidatorInPool(pool: DaoPool, validatorAddress: Address): ValidatorInPool {
  let id = validatorAddress.concat(pool.id);
  let validatorInPool = ValidatorInPool.load(id);

  if (validatorInPool == null) {
    validatorInPool = new ValidatorInPool(id);
    validatorInPool.balance = BigInt.zero();

    validatorInPool.pool = pool.id;
  }

  return validatorInPool;
}
