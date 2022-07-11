import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import { Vest } from "../../../generated/schema";

export function getVest(hash: Bytes, baseAmount: BigInt, lpAmount: BigInt, pool: Address): Vest {
  let vest = Vest.load(hash);

  if (vest == null) {
    vest = new Vest(hash);

    vest.baseAmount = baseAmount;
    vest.lpAmount = lpAmount;
    vest.pool = pool;
  }

  return vest;
}
