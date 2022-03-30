import { Address } from "@graphprotocol/graph-ts";
import { ProposalContract } from "../../../../generated/schema";

export function getProposalContract(addr: Address): ProposalContract {
  let id = addr.toHexString();
  let proposal = ProposalContract.load(id);

  if (proposal == null) {
    proposal = new ProposalContract(id);
  }

  return proposal;
}
