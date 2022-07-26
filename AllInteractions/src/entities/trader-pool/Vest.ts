import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import { Vest } from "../../../generated/schema";

export function getVest(hash: Bytes, baseAmount: BigInt, lpAmount: BigInt, pool: Address, count: BigInt): Vest {
  let id = hash.concat(Bytes.fromByteArray(Bytes.fromBigInt(count)));

  let vest = Vest.load(id);

  if (vest == null) {
    vest = new Vest(id);

    vest.baseAmount = baseAmount;
    vest.lpAmount = lpAmount;
    vest.pool = pool;
  }

  return vest;
}
