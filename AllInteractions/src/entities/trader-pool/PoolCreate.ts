import { Address, Bytes } from "@graphprotocol/graph-ts";
import { PoolCreate } from "../../../generated/schema";

export function getPoolCreate(hash: Bytes, pool: Address): PoolCreate {
  let poolCreate = PoolCreate.load(hash.toHexString());

  if (poolCreate == null) {
    poolCreate = new PoolCreate(hash.toHexString());
    poolCreate.pool = pool;
    poolCreate.transaction = "";
  }

  return poolCreate;
}
