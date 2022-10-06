import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestProposalConvertToDividends } from "../../../../generated/schema";

export function getInvestProposalConvertToDividends(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  amount: BigInt,
  token: Address,
  count: BigInt
): InvestProposalConvertToDividends {
  let id = hash.concatI32(count.toI32());
  let convertToDividends = InvestProposalConvertToDividends.load(id);

  if (convertToDividends == null) {
    convertToDividends = new InvestProposalConvertToDividends(id);

    convertToDividends.pool = pool;
    convertToDividends.proposalId = proposalId;

    convertToDividends.amount = amount;
    convertToDividends.token = token;

    convertToDividends.transaction = Bytes.empty();
  }

  return convertToDividends;
}
