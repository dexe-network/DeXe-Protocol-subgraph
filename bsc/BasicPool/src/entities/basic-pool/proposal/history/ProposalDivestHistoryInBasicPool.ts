import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalDivestHistoryInBasicPool } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalDivestHistoryInBasicPool(
  timestamp: BigInt,
  proposal: string
): ProposalDivestHistoryInBasicPool {
  let day = timestamp.div(BigInt.fromU32(DAY)); 
  let id = proposal + day.toString();
  let history = ProposalDivestHistoryInBasicPool.load(id);

  if (history == null) {
    history = new ProposalDivestHistoryInBasicPool(id);

    history.totalDivestVolumeLP = BigInt.zero();
    history.totalDivestVolumeBase = BigInt.zero();
    history.proposal = proposal;
    history.day = day;
  }

  return history;
}
