import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Proposal, ProposalSupply } from "../../../../generated/schema";

export function getProposalSupply(
  hash: Bytes,
  proposal: Proposal,
  amount: BigInt = BigInt.zero(),
  token: Address = Address.zero(),
  investor: Address = Address.zero(),
  timestamp: BigInt = BigInt.zero()
): ProposalSupply {
  let id = hash.toHexString();
  let supply = ProposalSupply.load(id);

  if (supply == null) {
    supply = new ProposalSupply(id);
    supply.proposal = proposal.id;
    supply.investor = investor;
    supply.amount = amount;
    supply.token = token;
    supply.timestamp = timestamp;
  }

  return supply;
}
