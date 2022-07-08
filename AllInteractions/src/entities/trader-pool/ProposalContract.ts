import { Address } from "@graphprotocol/graph-ts";
import { ProposalContract } from "../../../generated/schema";

export function getProposalContract(address: Address, pool: Address = Address.zero()): ProposalContract {
  let proposalContract = ProposalContract.load(address);

  if (proposalContract == null) {
    proposalContract = new ProposalContract(address);
    proposalContract.pool = pool;
  }

  return proposalContract;
}
