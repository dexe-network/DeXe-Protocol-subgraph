import { Address } from "@graphprotocol/graph-ts";
import { ProposalContract } from "../../../../generated/schema";

export function getProposalContract(
  contractAddress: Address,
  traderPoolAddress: Address = Address.zero()
): ProposalContract {
  let contract = ProposalContract.load(contractAddress.toHexString());

  if (contract == null) {
    contract = new ProposalContract(contractAddress.toHexString());
    contract.traderPool = traderPoolAddress.toHexString();
  }

  return contract;
}
