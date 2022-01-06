import { BigInt } from "@graphprotocol/graph-ts";
import { ProposalExchangeHistoryInInvestPool } from "../../../../../generated/schema";
import { DAY } from "../../../global/globals";

export function getProposalExchangeHistoryInInvestPool(
  timestamp: BigInt,
  proposal: string
): ProposalExchangeHistoryInInvestPool {
  let id = timestamp.div(BigInt.fromU32(DAY));
  let history = ProposalExchangeHistoryInInvestPool.load(id.toString());

  if (history == null) {
    history = new ProposalExchangeHistoryInInvestPool(id.toString());

    history.proposal = proposal;
  }

  return history;
}
