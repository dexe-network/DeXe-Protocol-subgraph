import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalExchangeHistoryInInvestPool } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalExchangeHistoryInInvestPool(
  timestamp: BigInt,
  proposal: string
): ProposalExchangeHistoryInInvestPool {
  let day = timestamp.div(BigInt.fromU32(DAY)); 
  let id = proposal + day.toString();
  let history = ProposalExchangeHistoryInInvestPool.load(id);

  if (history == null) {
    history = new ProposalExchangeHistoryInInvestPool(id);

    history.proposal = proposal;
    history.day = day;
  }

  return history;
}
