import { Bytes } from "@graphprotocol/graph-ts";
import { Pool } from "../../../generated/schema";

export function getPool(address: Bytes): Pool {
  let pool = Pool.load(address);

  if (pool == null) {
    pool = new Pool(address);
  }

  return pool;
}
