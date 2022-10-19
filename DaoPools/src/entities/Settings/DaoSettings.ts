import { BigInt } from "@graphprotocol/graph-ts";
import { DaoPool } from "../../../generated/schema";
import { DaoSettings } from "../../../generated/templates";
import { SettingsChangedSettingsStruct } from "../../../generated/templates/DaoSettings/DaoSettings";

export function getDaoSettings(
  pool: DaoPool,
  settingsId: BigInt = BigInt.zero(),
  settingsStruct: SettingsChangedSettingsStruct = new SettingsChangedSettingsStruct()
): DaoSettings {}
