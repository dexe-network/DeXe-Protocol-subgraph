import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalDivestHistory } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalDivestHistory(timestamp: BigInt, proposal: string): ProposalDivestHistory {
  let day = timestamp.div(BigInt.fromU32(DAY));
  let id = proposal + day.toString();
  let history = ProposalDivestHistory.load(id);

  if (history == null) {
    history = new ProposalDivestHistory(id);

    history.totalDivestVolume = BigInt.zero();
    history.proposal = proposal;
    history.day = day;
  }

  return history;
}
