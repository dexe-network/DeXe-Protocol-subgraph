import { Address } from "@graphprotocol/graph-ts";
import { RiskyProposalContract } from "../../../../generated/schema";

export function getProposalContract(
  contractAddress: Address,
  traderPoolAddress: Address = Address.zero()
): RiskyProposalContract {
  let contract = RiskyProposalContract.load(contractAddress.toHexString());

  if (contract == null) {
    contract = new RiskyProposalContract(contractAddress.toHexString());
    contract.traderPool = traderPoolAddress.toHexString();
  }

  return contract;
}
