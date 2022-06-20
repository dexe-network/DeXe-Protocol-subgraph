import {
  ProposalCreated,
  ProposalWithdrawn,
  ProposalSupplied,
} from "../../generated/templates/InvestProposal/InvestProposal";
import { getProposal } from "../entities/invest-pool/proposal/Proposal";
import { getProposalSupply } from "../entities/invest-pool/proposal/ProposalSupply";
import { getProposalWithdrawal } from "../entities/invest-pool/proposal/ProposalWithdrawal";

export function onProposalCreated(event: ProposalCreated): void {
  let proposal = getProposal(
    event.params.index,
    event.address,
    event.params.proposalLimits[0].toBigInt(),
    event.params.proposalLimits[1].toBigInt()
  );
  proposal.save();
}

export function onWithdrawn(event: ProposalWithdrawn): void {
  let proposal = getProposal(event.params.index, event.address);
  let withdraw = getProposalWithdrawal(
    event.transaction.hash,
    proposal,
    event.params.amount,
    event.params.investor,
    event.block.timestamp
  );

  proposal.save();
  withdraw.save();
}

export function onSupplied(event: ProposalSupplied): void {
  let proposal = getProposal(event.params.index, event.address);
  let supply = getProposalSupply(
    event.transaction.hash,
    proposal,
    event.params.amount,
    event.params.token,
    event.params.investor,
    event.block.timestamp
  );

  proposal.save();
  supply.save();
}
