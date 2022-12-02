import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolMovedToValidators } from "../../../generated/schema";

export function getDaoPoolMovedToValidators(
  hash: Bytes,
  pool: Address,
  propsalId: BigInt,
  count: BigInt
): DaoPoolMovedToValidators {
  let id = hash.concatI32(count.toI32());
  let moved = DaoPoolMovedToValidators.load(id);

  if (moved == null) {
    moved = new DaoPoolMovedToValidators(id);
    moved.pool = pool;
    moved.proposalId = propsalId;
    moved.transaction = Bytes.empty();
  }

  return moved;
}
