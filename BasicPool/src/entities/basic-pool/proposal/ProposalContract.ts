import { Address, Bytes } from "@graphprotocol/graph-ts";
import { ProposalContract } from "../../../../generated/schema";

export function getProposalContract(
  proposalContractAddress: Address,
  basicPool: Bytes = Bytes.empty()
): ProposalContract {
  let proposalContract = ProposalContract.load(proposalContractAddress);

  if (proposalContract == null) {
    proposalContract = new ProposalContract(proposalContractAddress);
    proposalContract.basicPool = basicPool;
  }

  return proposalContract;
}
