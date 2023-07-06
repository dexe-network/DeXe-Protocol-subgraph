import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolOffchainResultsSaved } from "../../../generated/schema";

export function getDaoPoolOffchainResult(hash: Bytes, pool: Address, count: BigInt): DaoPoolOffchainResultsSaved {
  let id = hash.concatI32(count.toI32());
  let daoPoolOffchainResultsSaved = DaoPoolOffchainResultsSaved.load(id);

  if (daoPoolOffchainResultsSaved == null) {
    daoPoolOffchainResultsSaved = new DaoPoolOffchainResultsSaved(id);
    daoPoolOffchainResultsSaved.pool = pool;

    daoPoolOffchainResultsSaved.transaction = Bytes.empty();
  }

  return daoPoolOffchainResultsSaved;
}
