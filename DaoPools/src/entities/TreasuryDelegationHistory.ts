import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPool, TreasuryDelegationHistory, VoterInPool } from "../../generated/schema";
import { getInteractionCount } from "./global/InteractionCount";
import { increaseCounter } from "../helpers/IncreaseCounter";
import { TreasuryDelegationType, getEnumBigInt } from "./global/TreasuryDelegationTypeEnum";

export function getTreasuryDelegationHistory(
  hash: Bytes,
  pool: DaoPool,
  timestamp: BigInt,
  to: VoterInPool,
  amount: BigInt,
  nfts: Array<BigInt>,
  type: TreasuryDelegationType
): TreasuryDelegationHistory {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());
  let history = TreasuryDelegationHistory.load(id);

  if (history == null) {
    history = new TreasuryDelegationHistory(id);
    history.amount = amount;
    history.delegatee = to.id;
    history.type = getEnumBigInt(type);
    history.timestamp = timestamp;
    history.nfts = nfts;

    history.pool = pool.id;

    increaseCounter(counter);
  }

  return history;
}
