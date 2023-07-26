import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPool, Expert, ExpertInPool } from "../../../generated/schema";

export function getExpertInPool(expert: Expert, pool: Bytes, tokenId: BigInt = BigInt.zero()): ExpertInPool {
  const id = expert.id.concat(pool);
  let expertInPool = ExpertInPool.load(id);

  if (expertInPool == null) {
    expertInPool = new ExpertInPool(id);
    expertInPool.tokenId = tokenId;

    expertInPool.expert = expert.id;
    expertInPool.pool = pool;
  }

  return expertInPool;
}
