import { BigInt } from "@graphprotocol/graph-ts";
import { Proposal, ProposalPositionOffset } from "../../../generated/schema";

export function getPositionOffset(proposal: Proposal): ProposalPositionOffset {
  let id = proposal.id;
  let positionOffset = ProposalPositionOffset.load(id);

  if (positionOffset == null) {
    positionOffset = new ProposalPositionOffset(id);

    positionOffset.offset = BigInt.zero();
  }

  return positionOffset;
}
