import { Address } from "@graphprotocol/graph-ts";
import { ProposalContract } from "../../../../generated/schema";

export function getProposalContract(
  contractAddress: Address,
  traderPoolAddress: Address = Address.zero(),
  proposalType: string = ""
): ProposalContract {
  let contract = ProposalContract.load(contractAddress);

  if (contract == null) {
    contract = new ProposalContract(contractAddress);
    contract.traderPool = traderPoolAddress;
    contract.proposalType = proposalType;
  }

  return contract;
}
