import {
  ProposalClaimed,
  ProposalCreated,
  ProposalSupplied,
  ProposalWithdrawn,
} from "../../generated/templates/TraderPoolInvestProposal/TraderPoolInvestProposal";

export function onProposalCreated(event: ProposalCreated): void {
  event.params.proposalId;
  event.params.user;
}

export function onProposalWithdrawn(event: ProposalWithdrawn): void {
  event.params.proposalId;
  event.params.amount;
  event.params.user;
}

export function onProposalSupplied(event: ProposalSupplied): void {
  event.params.proposalId;
  event.params.tokens;
  event.params.amounts;
  event.params.user;
}

export function onProposalClaimed(event: ProposalClaimed): void {
  event.params.proposalId;
  event.params.tokens;
  event.params.amounts;
  event.params.user;
}
