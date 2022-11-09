import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolRewardClaimed } from "../../../generated/schema";

export function getDaoPoolRewardClaimed(
  hash: Bytes,
  pool: Address,
  proposalId: BigInt,
  count: BigInt
): DaoPoolRewardClaimed {
  let id = hash.concatI32(count.toI32());
  let claimed = DaoPoolRewardClaimed.load(id);

  if (claimed == null) {
    claimed = new DaoPoolRewardClaimed(id);
    claimed.pool = pool;
    claimed.proposalId = proposalId;

    claimed.transaction = Bytes.empty();
  }

  return claimed;
}
