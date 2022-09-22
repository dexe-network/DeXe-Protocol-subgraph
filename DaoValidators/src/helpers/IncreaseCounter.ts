import { BigInt } from "@graphprotocol/graph-ts";
import { InteractionCount } from "../../generated/schema";

export function increaseCounter(counter: InteractionCount): void {
  counter.count = counter.count.plus(BigInt.fromI32(1));
  counter.save();
}
