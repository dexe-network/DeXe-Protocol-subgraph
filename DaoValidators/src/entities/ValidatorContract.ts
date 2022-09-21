import { Address } from "@graphprotocol/graph-ts";
import { ValidatorsContract } from "../../generated/schema";

export function getValidatorContract(
  validatorsContractAddress: Address,
  poolAddress: Address = Address.zero()
): ValidatorsContract {
  let contract = ValidatorsContract.load(validatorsContractAddress);

  if (contract == null) {
    contract = new ValidatorsContract(validatorsContractAddress);
    contract.pool = poolAddress;
  }

  return contract;
}
