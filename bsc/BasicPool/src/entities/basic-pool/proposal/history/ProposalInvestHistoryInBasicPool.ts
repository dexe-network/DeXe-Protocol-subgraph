import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalInvestHistoryInBasicPool } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalInvestHistoryInBasicPool(
  timestamp: BigInt,
  proposal: string
): ProposalInvestHistoryInBasicPool {
  let day = timestamp.div(BigInt.fromU32(DAY)); 
  let id = proposal + day.toString();
  let history = ProposalInvestHistoryInBasicPool.load(id);

  if (history == null) {
    history = new ProposalInvestHistoryInBasicPool(id);

    history.totalInvestVolumeLP = BigInt.zero();
    history.totalInvestVolumeBase = BigInt.zero();
    history.proposal = proposal;
    history.day = day;
  }

  return history;
}
