import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DistributionProposal, Proposal } from "../../generated/schema";

export function getDistributionProposal(
  proposal: Proposal,
  token: Address = Address.zero(),
  amount: BigInt = BigInt.zero()
): DistributionProposal {
  let id = proposal.id;
  let dp = DistributionProposal.load(id);

  if (dp == null) {
    dp = new DistributionProposal(id);
    dp.token = token;
    dp.amount = amount;
  }

  return dp;
}
