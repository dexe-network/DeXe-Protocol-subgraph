import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalInvestHistoryInInvestPool } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalInvestHistoryInInvestPool(
  timestamp: BigInt,
  proposal: string
): ProposalInvestHistoryInInvestPool {
  let id = timestamp.div(BigInt.fromU32(DAY));
  let history = ProposalInvestHistoryInInvestPool.load(id.toString());

  if (history == null) {
    history = new ProposalInvestHistoryInInvestPool(id.toString());

    history.totalInvestVolumeLP = BigInt.zero();
    history.totalInvestVolumeBase = BigInt.zero();
    history.proposal = proposal;
  }

  return history;
}
