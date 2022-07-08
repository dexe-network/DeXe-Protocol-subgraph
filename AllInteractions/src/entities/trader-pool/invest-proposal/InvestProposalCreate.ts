import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestProposalCreate } from "../../../../generated/schema";

export function getInvestProposalCreate(hash: Bytes, pool: Bytes, proposalId: BigInt): InvestProposalCreate {
  let proposalCreate = InvestProposalCreate.load(hash);

  if (proposalCreate == null) {
    proposalCreate = new InvestProposalCreate(hash);

    proposalCreate.pool = pool;
    proposalCreate.proposalId = proposalId;

    proposalCreate.transaction = Bytes.empty();
  }

  return proposalCreate;
}
