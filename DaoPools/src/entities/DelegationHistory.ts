import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPool, DelegationHistory, Voter } from "../../generated/schema";
import { getInteractionCount } from "./global/InteractionCount";
import { increaseCounter } from "../helpers/IncreaseCounter";

export function getDelegationHistory(
  hash: Bytes,
  pool: DaoPool,
  timestamp: BigInt,
  from: Voter,
  to: Voter,
  amount: BigInt,
  isDelegate: boolean
): DelegationHistory {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());
  let history = DelegationHistory.load(id);

  if (history == null) {
    history = new DelegationHistory(id);
    history.amount = amount;
    history.from = from.id;
    history.to = to.id;
    history.isDelegate = isDelegate;
    history.timestamp = timestamp;

    history.pool = pool.id;

    increaseCounter(counter);
  }

  return history;
}
