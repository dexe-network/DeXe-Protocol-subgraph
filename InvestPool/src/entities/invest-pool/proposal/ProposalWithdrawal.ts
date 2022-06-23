import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Proposal, ProposalWithdrawal } from "../../../../generated/schema";

export function getProposalWithdrawal(
  hash: Bytes,
  proposal: Proposal,
  amount: BigInt = BigInt.zero(),
  investor: Address = Address.zero(),
  timestamp: BigInt = BigInt.zero()
): ProposalWithdrawal {
  let id = hash.toHexString();
  let withdraw = ProposalWithdrawal.load(id);
  if (withdraw == null) {
    withdraw = new ProposalWithdrawal(id);
    withdraw.proposal = proposal.id;
    withdraw.investor = investor;
    withdraw.amount = amount;
    withdraw.timestamp = timestamp;
  }
  return withdraw;
}
