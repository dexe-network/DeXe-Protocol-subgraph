import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalSupplyHistory } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalSupplyHistory(timestamp: BigInt, proposal: string): ProposalSupplyHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = proposal + day.toString();
  let history = ProposalSupplyHistory.load(id);

  if (history == null) {
    history = new ProposalSupplyHistory(id);
    history.proposal = proposal;
    history.day = day;
  }
  return history;
}
