import { BigInt } from "@graphprotocol/graph-ts";
import { Proposal, ProposalContract } from "../../../../generated/schema";
import { getLastSupply } from "./ProposalLastSupply";
import { getLastWithdraw } from "./ProposalLastWithdraw";

export function getProposal(
  index: BigInt,
  proposalContract: ProposalContract,
  timestampLimit: BigInt = BigInt.zero(),
  investLPLimit: BigInt = BigInt.zero()
): Proposal {
  let id = proposalContract.id + index.toString();
  let proposal = Proposal.load(id);

  if (proposal == null) {
    proposal = new Proposal(id);

    proposal.timestampLimit = timestampLimit;
    proposal.investLPLimit = investLPLimit;
    proposal.investPool = proposalContract.investPool;
    proposal.lastSupply = getLastSupply(proposal).id;
    proposal.lastWithdraw = getLastWithdraw(proposal).id;
  }

  return proposal;
}
