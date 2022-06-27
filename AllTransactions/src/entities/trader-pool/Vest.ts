import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { Vest } from "../../../generated/schema";

export function getVest(hash: Bytes, amount: BigInt): Vest {
  let id = hash.toHexString();
  let vest = Vest.load(id);

  if (vest == null) {
    vest = new Vest(id);

    vest.amount = amount;
  }

  return vest;
}
