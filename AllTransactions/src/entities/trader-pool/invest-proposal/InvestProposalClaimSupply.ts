import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestProposalClaimSupply } from "../../../../generated/schema";

export function getInvestProposalClaimSupply(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  tokens: Array<Bytes>,
  amounts: Array<BigInt>
): InvestProposalClaimSupply {
  let id = hash.toHexString();
  let claimSupply = InvestProposalClaimSupply.load(id);

  if (claimSupply == null) {
    claimSupply = new InvestProposalClaimSupply(id);

    claimSupply.pool = pool;
    claimSupply.proposalId = proposalId;

    claimSupply.tokens = tokens;
    claimSupply.amounts = amounts;

    claimSupply.transaction = "";
  }

  return claimSupply;
}
