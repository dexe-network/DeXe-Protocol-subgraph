import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TokenSaleTierBuyHistory, TokenSaleTier, VoterInPool } from "../../generated/schema";
import { increaseCounter } from "../helpers/IncreaseCounter";
import { getInteractionCount } from "./global/InteractionCount";

export function getTokenSaleTierBuyHistory(
  hash: Bytes,
  timestamp: BigInt,
  tokenSaleTier: TokenSaleTier,
  buyer: VoterInPool
): TokenSaleTierBuyHistory {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());

  let history = TokenSaleTierBuyHistory.load(id);

  if (history == null) {
    history = new TokenSaleTierBuyHistory(id);

    history.hash = hash;
    history.timestamp = timestamp;

    history.buyer = buyer.id;
    history.tier = tokenSaleTier.id;
    increaseCounter(counter);
  }

  return history;
}
