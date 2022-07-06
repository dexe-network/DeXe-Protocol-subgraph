import { Address, Bytes } from "@graphprotocol/graph-ts";
import { PoolCreate } from "../../../generated/schema";

export function getPoolCreate(hash: Bytes, pool: Address, symbol: string): PoolCreate {
  let poolCreate = PoolCreate.load(hash);

  if (poolCreate == null) {
    poolCreate = new PoolCreate(hash);
    poolCreate.pool = pool;
    poolCreate.symbol = symbol;

    poolCreate.transaction = Bytes.empty();
  }

  return poolCreate;
}
