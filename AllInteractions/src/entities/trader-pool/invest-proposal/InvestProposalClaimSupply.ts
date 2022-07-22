import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestProposalClaimOrSupply } from "../../../../generated/schema";

export function getInvestProposalClaimOrSupply(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  tokens: Array<Bytes>,
  amounts: Array<BigInt>,
  count: BigInt
): InvestProposalClaimOrSupply {
  let id = hash.concatI32(count.toI32());
  let claimSupply = InvestProposalClaimOrSupply.load(id);

  if (claimSupply == null) {
    claimSupply = new InvestProposalClaimOrSupply(id);

    claimSupply.pool = pool;
    claimSupply.proposalId = proposalId;

    claimSupply.tokens = tokens;
    claimSupply.amounts = amounts;

    claimSupply.transaction = Bytes.empty();
  }

  return claimSupply;
}
