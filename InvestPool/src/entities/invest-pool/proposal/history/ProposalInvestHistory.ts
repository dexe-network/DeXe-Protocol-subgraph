import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalInvestHistory } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalInvestHistory(timestamp: BigInt, proposal: string): ProposalInvestHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = proposal + day.toString();
  let history = ProposalInvestHistory.load(id);

  if (history == null) {
    history = new ProposalInvestHistory(id);

    history.totalInvestVolumeLP = BigInt.zero();
    history.totalInvestVolumeBase = BigInt.zero();
    history.proposal = proposal;
    history.day = day;
  }

  return history;
}
