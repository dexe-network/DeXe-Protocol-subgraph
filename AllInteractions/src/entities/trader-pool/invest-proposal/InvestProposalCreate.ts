import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestProposalCreate } from "../../../../generated/schema";

export function getInvestProposalCreate(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  count: BigInt
): InvestProposalCreate {
  let id = hash.concatI32(count.toI32());
  let proposalCreate = InvestProposalCreate.load(id);

  if (proposalCreate == null) {
    proposalCreate = new InvestProposalCreate(id);

    proposalCreate.pool = pool;
    proposalCreate.proposalId = proposalId;

    proposalCreate.transaction = Bytes.empty();
  }

  return proposalCreate;
}
