import { Address } from "@graphprotocol/graph-ts";
import { ProposalContract } from "../../../../generated/schema";

export function getProposalContract(
  contractAddress: Address,
  traderPoolAddress: Address = Address.zero(),
  proposalType: String = ""
): ProposalContract {
  let contract = ProposalContract.load(contractAddress.toHexString());

  if (contract == null) {
    contract = new ProposalContract(contractAddress.toHexString());
    contract.traderPool = traderPoolAddress.toHexString();
    contract.proposalType = proposalType;
  }

  return contract;
}
