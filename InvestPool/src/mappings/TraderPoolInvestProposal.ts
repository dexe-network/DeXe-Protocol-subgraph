import {
  ProposalCreated,
  ProposalWithdrawn,
  ProposalSupplied,
} from "../../generated/templates/InvestProposal/InvestProposal";
import { getProposal } from "../entities/invest-pool/proposal/Proposal";
import { getProposalContract } from "../entities/invest-pool/proposal/ProposalContract";
import { getProposalSupply } from "../entities/invest-pool/proposal/ProposalSupply";
import { getProposalWithdrawal } from "../entities/invest-pool/proposal/ProposalWithdrawal";

export function onProposalCreated(event: ProposalCreated): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(
    event.params.proposalId,
    proposalContract,
    event.params.proposalLimits[0].toBigInt(),
    event.params.proposalLimits[1].toBigInt()
  );
  proposal.save();
  proposalContract.save();
}

export function onWithdrawn(event: ProposalWithdrawn): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(event.params.proposalId, proposalContract);
  let withdraw = getProposalWithdrawal(
    event.transaction.hash,
    proposal,
    event.params.amount,
    event.params.admin,
    event.block.timestamp
  );

  proposal.save();
  withdraw.save();
  proposalContract.save();
}

export function onSupplied(event: ProposalSupplied): void {
  let proposalContract = getProposalContract(event.address);
  let proposal = getProposal(event.params.proposalId, proposalContract);
  let supply = getProposalSupply(
    event.transaction.hash,
    proposal,
    event.params.amount,
    event.params.token,
    event.params.admin,
    event.block.timestamp
  );

  proposal.save();
  supply.save();
  proposalContract.save();
}
