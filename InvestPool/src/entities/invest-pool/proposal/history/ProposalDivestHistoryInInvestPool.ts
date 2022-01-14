import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalDivestHistoryInInvestPool } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalDivestHistoryInInvestPool(
  timestamp: BigInt,
  proposal: string
): ProposalDivestHistoryInInvestPool {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = proposal + day.toString();
  let history = ProposalDivestHistoryInInvestPool.load(id);

  if (history == null) {
    history = new ProposalDivestHistoryInInvestPool(id);

    history.totalDivestVolumeLP = BigInt.zero();
    history.totalDivestVolumeBase = BigInt.zero();
    history.proposal = proposal;
    history.day = day;
  }

  return history;
}
