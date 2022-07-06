import { BigInt } from "@graphprotocol/graph-ts";
import { Investor, ProposalPositionOffset, TraderPool } from "../../../generated/schema";

export function getProposalPositionOffset(
  pool: TraderPool,
  investor: Investor,
  proposalId: BigInt
): ProposalPositionOffset {
  let id = pool.id.toHexString() + investor.id.toHexString() + proposalId.toString();
  let positionOffset = ProposalPositionOffset.load(id);

  if (positionOffset == null) {
    positionOffset = new ProposalPositionOffset(id);

    positionOffset.offset = BigInt.zero();
  }

  return positionOffset;
}
