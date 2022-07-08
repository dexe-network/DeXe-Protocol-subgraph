import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestProposalClaimOrSupply } from "../../../../generated/schema";

export function getInvestProposalClaimOrSupply(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  tokens: Array<Bytes>,
  amounts: Array<BigInt>
): InvestProposalClaimOrSupply {
  let claimSupply = InvestProposalClaimOrSupply.load(hash);

  if (claimSupply == null) {
    claimSupply = new InvestProposalClaimOrSupply(hash);

    claimSupply.pool = pool;
    claimSupply.proposalId = proposalId;

    claimSupply.tokens = tokens;
    claimSupply.amounts = amounts;

    claimSupply.transaction = Bytes.empty();
  }

  return claimSupply;
}
