import { BigInt } from "@graphprotocol/graph-ts";
import { LastWithdraw, Proposal } from "../../../../generated/schema";

export function getLastWithdraw(proposal: Proposal): LastWithdraw {
  let withdraw = LastWithdraw.load(proposal.id);

  if (withdraw == null) {
    withdraw = new LastWithdraw(proposal.id);
    withdraw.amountBase = BigInt.zero();
    withdraw.timestamp = BigInt.zero();
  }

  return withdraw;
}
