import { Address } from "@graphprotocol/graph-ts";
import { ProposalContract } from "../../../../generated/schema";

export function getProposalContract(proposalContractAddress: Address, basicPool: string = ""): ProposalContract {
  let id = proposalContractAddress.toHexString();
  let proposalContract = ProposalContract.load(id);

  if (proposalContract == null) {
    proposalContract = new ProposalContract(id);
    proposalContract.basicPool = basicPool;
  }

  return proposalContract;
}
