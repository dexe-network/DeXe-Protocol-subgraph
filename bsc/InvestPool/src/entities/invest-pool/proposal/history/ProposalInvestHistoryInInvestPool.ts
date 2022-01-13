import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalInvestHistoryInInvestPool } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalInvestHistoryInInvestPool(
  timestamp: BigInt,
  proposal: string
): ProposalInvestHistoryInInvestPool {
  let day = timestamp.div(BigInt.fromU32(DAY)); 
  let id = proposal + day.toString();
  let history = ProposalInvestHistoryInInvestPool.load(id);

  if (history == null) {
    history = new ProposalInvestHistoryInInvestPool(id);

    history.totalInvestVolumeLP = BigInt.zero();
    history.totalInvestVolumeBase = BigInt.zero();
    history.proposal = proposal;
    history.day = day;
  }

  return history;
}
