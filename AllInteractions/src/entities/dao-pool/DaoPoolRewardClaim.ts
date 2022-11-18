import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolRewardClaim } from "../../../generated/schema";

export function getDaoPoolRewardClaim(
  hash: Bytes,
  pool: Address,
  proposalId: BigInt,
  count: BigInt
): DaoPoolRewardClaim {
  let id = hash.concatI32(count.toI32());
  let claimed = DaoPoolRewardClaim.load(id);

  if (claimed == null) {
    claimed = new DaoPoolRewardClaim(id);
    claimed.pool = pool;
    claimed.proposalId = proposalId;

    claimed.transaction = Bytes.empty();
  }

  return claimed;
}
