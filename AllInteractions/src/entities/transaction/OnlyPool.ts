import { Address, Bytes } from "@graphprotocol/graph-ts";
import { OnlyPool } from "../../../generated/schema";

export function getOnlyPool(hash: Bytes, address: Address): OnlyPool {
  let onlyPool = OnlyPool.load(hash.toHexString());

  if (onlyPool == null) {
    onlyPool = new OnlyPool(hash.toHexString());
    onlyPool.pool = address;
    onlyPool.transaction = "";
  }

  return onlyPool;
}
