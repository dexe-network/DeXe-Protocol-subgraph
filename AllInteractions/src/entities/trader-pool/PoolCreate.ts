import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { PoolCreate } from "../../../generated/schema";

export function getPoolCreate(hash: Bytes, pool: Address, symbol: string, count: BigInt): PoolCreate {
  let id = hash.concatI32(count.toI32());
  let poolCreate = PoolCreate.load(id);

  if (poolCreate == null) {
    poolCreate = new PoolCreate(id);
    poolCreate.pool = pool;
    poolCreate.symbol = symbol;

    poolCreate.transaction = Bytes.empty();
  }

  return poolCreate;
}
