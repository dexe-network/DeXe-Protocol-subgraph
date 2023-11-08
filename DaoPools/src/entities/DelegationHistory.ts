import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPool, DelegationHistory, Voter } from "../../generated/schema";
import { getInteractionCount } from "./global/InteractionCount";
import { increaseCounter } from "../helpers/IncreaseCounter";
import { DelegationType, getEnumBigInt } from "./global/DelegationTypeEnum";

export function getDelegationHistory(
  hash: Bytes,
  pool: DaoPool,
  timestamp: BigInt,
  from: Voter,
  to: Voter,
  amount: BigInt,
  nfts: Array<BigInt>,
  type: DelegationType
): DelegationHistory {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());
  let history = DelegationHistory.load(id);

  if (history == null) {
    history = new DelegationHistory(id);
    history.amount = amount;
    history.delegator = from.id;
    history.delegatee = to.id;
    history.type = getEnumBigInt(type);
    history.timestamp = timestamp;
    history.nfts = nfts;

    history.pool = pool.id;

    increaseCounter(counter);
  }

  return history;
}
