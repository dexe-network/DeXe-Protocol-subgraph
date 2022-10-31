import { Address } from "@graphprotocol/graph-ts";
import { SettingsContract } from "../../generated/schema";

export function getSettingsContract(settingsAddress: Address, poolId: Address = Address.zero()): SettingsContract {
  let settingsContract = SettingsContract.load(settingsAddress);

  if (settingsContract == null) {
    settingsContract = new SettingsContract(settingsAddress);
    settingsContract.daoPool = poolId;
  }

  return settingsContract;
}
