import { BigInt } from "@graphprotocol/graph-ts";
import { DaoPool } from "../../../generated/schema";
import { ProposalSettings } from "../../../generated/schema";

export function getProposalSettings(pool: DaoPool, settingsId: BigInt): ProposalSettings {
  let id = pool.id.concatI32(settingsId.toI32());
  let proposalSettings = ProposalSettings.load(id);

  if (proposalSettings == null) {
    proposalSettings = new ProposalSettings(id);

    proposalSettings.settingsId = settingsId;
    proposalSettings.executorDescription = "";

    proposalSettings.pool = pool.id;
  }

  return proposalSettings;
}
