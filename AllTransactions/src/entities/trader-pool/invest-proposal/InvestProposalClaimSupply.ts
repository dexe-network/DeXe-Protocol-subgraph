import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestProposalClaimOrSupply } from "../../../../generated/schema";

export function getInvestProposalClaimOrSupply(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  tokens: Array<Bytes>,
  amounts: Array<BigInt>
): InvestProposalClaimOrSupply {
  let id = hash.toHexString();
  let claimSupply = InvestProposalClaimOrSupply.load(id);

  if (claimSupply == null) {
    claimSupply = new InvestProposalClaimOrSupply(id);

    claimSupply.pool = pool;
    claimSupply.proposalId = proposalId;

    claimSupply.tokens = tokens;
    claimSupply.amounts = amounts;

    claimSupply.transaction = "";
  }

  return claimSupply;
}
