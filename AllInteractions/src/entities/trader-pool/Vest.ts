import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { Vest } from "../../../generated/schema";

export function getVest(hash: Bytes, baseAmount: BigInt, lpAmount: BigInt): Vest {
  let vest = Vest.load(hash);

  if (vest == null) {
    vest = new Vest(hash);

    vest.baseAmount = baseAmount;
    vest.lpAmount = lpAmount;
  }

  return vest;
}
