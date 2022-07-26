import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { OnlyPool } from "../../../generated/schema";

export function getOnlyPool(hash: Bytes, address: Address, count: BigInt): OnlyPool {
  let id = hash.concatI32(count.toI32());
  let onlyPool = OnlyPool.load(id);

  if (onlyPool == null) {
    onlyPool = new OnlyPool(id);
    onlyPool.pool = address;
    onlyPool.transaction = Bytes.empty();
  }

  return onlyPool;
}
