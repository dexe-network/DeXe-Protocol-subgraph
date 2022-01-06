import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalDivestHistoryInInvestPool } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalDivestHistoryInInvestPool(
  timestamp: BigInt,
  proposal: string
): ProposalDivestHistoryInInvestPool {
  let id = timestamp.div(BigInt.fromU32(DAY));
  let history = ProposalDivestHistoryInInvestPool.load(id.toString());

  if (history == null) {
    history = new ProposalDivestHistoryInInvestPool(id.toString());

    history.totalDivestVolumeLP = BigInt.zero();
    history.totalDivestVolumeBase = BigInt.zero();
    history.proposal = proposal;
  }

  return history;
}
