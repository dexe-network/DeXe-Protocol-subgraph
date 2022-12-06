import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolExecute } from "../../../generated/schema";

export function getDaoPoolExecute(hash: Bytes, pool: Address, proposalId: BigInt, count: BigInt): DaoPoolExecute {
  let id = hash.concatI32(count.toI32());
  let proposalExecute = DaoPoolExecute.load(id);

  if (proposalExecute == null) {
    proposalExecute = new DaoPoolExecute(id);
    proposalExecute.pool = pool;
    proposalExecute.proposalId = proposalId;

    proposalExecute.transaction = Bytes.empty();
  }

  return proposalExecute;
}
