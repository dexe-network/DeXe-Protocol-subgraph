import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Proposal, Withdraw } from "../../../../generated/schema";
import { increaseCounter } from "../../../helpers/IncreaseCounter";
import { getInteractionCount } from "../../global/InteractionCount";

export function getWithdraw(
  hash: Bytes,
  proposal: Proposal,
  amountBase: BigInt = BigInt.zero(),
  timestamp: BigInt = BigInt.zero()
): Withdraw {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());
  let withdraw = Withdraw.load(id);

  if (withdraw == null) {
    withdraw = new Withdraw(id);
    withdraw.proposal = proposal.id;
    withdraw.amountBase = amountBase;
    withdraw.timestamp = timestamp;

    increaseCounter(counter);
  }

  return withdraw;
}
