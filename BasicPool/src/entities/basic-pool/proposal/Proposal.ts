import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Proposal, ProposalContract } from "../../../../generated/schema";

export function getProposal(
  index: BigInt,
  proposalContract: ProposalContract,
  token: Address = Address.zero(),
  timestampLimit: BigInt = BigInt.zero(),
  investLPLimit: BigInt = BigInt.zero(),
  maxTokenPriceLimit: BigInt = BigInt.zero()
): Proposal {
  let id = proposalContract.id.toHexString() + index.toString();
  let proposal = Proposal.load(id);

  if (proposal == null) {
    proposal = new Proposal(id);

    proposal.token = token;
    proposal.timestampLimit = timestampLimit;
    proposal.investLPLimit = investLPLimit;
    proposal.maxTokenPriceLimit = maxTokenPriceLimit;
    proposal.basicPool = proposalContract.basicPool;
  }

  return proposal;
}
