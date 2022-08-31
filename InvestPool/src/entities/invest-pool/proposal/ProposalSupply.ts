import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Supply } from "../../../../generated/schema";
import { increaseCounter } from "../../../helpers/IncreaseCounter";
import { getInteractionCount } from "../../global/InteractionCount";

export function getSupply(
  hash: Bytes,
  dividendsTokens: Array<Bytes> = new Array<Bytes>(),
  amountDividendsTokens: Array<BigInt> = new Array<BigInt>(),
  timestamp: BigInt = BigInt.zero()
): Supply {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());
  let supply = Supply.load(id);

  if (supply == null) {
    supply = new Supply(id);
    supply.dividendsTokens = dividendsTokens;
    supply.amountDividendsTokens = amountDividendsTokens;
    supply.timestamp = timestamp;

    increaseCounter(counter);
  }

  return supply;
}