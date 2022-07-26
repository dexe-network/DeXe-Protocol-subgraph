import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InteractionCount } from "../../../generated/schema";

export function getInteractionCount(hash: Bytes): InteractionCount {
  let counter = InteractionCount.load(hash);

  if (counter == null) {
    counter = new InteractionCount(hash);
    counter.count = BigInt.zero();
  }
  return counter;
}
