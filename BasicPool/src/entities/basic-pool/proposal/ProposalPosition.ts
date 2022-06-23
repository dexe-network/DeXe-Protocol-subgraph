import { BigInt } from "@graphprotocol/graph-ts";
import { Proposal, ProposalPosition, ProposalPositionOffset } from "../../../../generated/schema";

export function getProposalPosition(proposal: Proposal, offset: ProposalPositionOffset): ProposalPosition {
  let id = proposal.id + "_" + offset.offset.toString();
  let proposalPosition = ProposalPosition.load(id);

  if (proposalPosition == null) {
    proposalPosition = new ProposalPosition(id);
    proposalPosition.isClosed = false;

    proposalPosition.totalBaseOpenVolume = BigInt.zero();
    proposalPosition.totalBaseCloseVolume = BigInt.zero();
    proposalPosition.totalPositionOpenVolume = BigInt.zero();
    proposalPosition.totalPositionCloseVolume = BigInt.zero();
    proposalPosition.totalUSDOpenVolume = BigInt.zero();
    proposalPosition.totalUSDCloseVolume = BigInt.zero();

    proposalPosition.proposal = proposal.id;
  }

  return proposalPosition;
}
