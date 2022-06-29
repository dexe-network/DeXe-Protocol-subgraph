import { Address } from "@graphprotocol/graph-ts";
import { ProposalContract } from "../../../generated/schema";

export function getProposalContract(address: Address, pool: Address = Address.zero()): ProposalContract {
  let proposalContract = ProposalContract.load(address.toHexString());

  if (proposalContract == null) {
    proposalContract = new ProposalContract(address.toHexString());
    proposalContract.pool = pool.toHexString();
  }

  return proposalContract;
}
