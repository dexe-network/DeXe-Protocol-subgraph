import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestProposalCreate } from "../../../../generated/schema";

export function getInvestProposalCreate(hash: Bytes, pool: Bytes, proposalId: BigInt): InvestProposalCreate {
  let id = hash.toHexString();
  let proposalCreate = InvestProposalCreate.load(id);

  if (proposalCreate == null) {
    proposalCreate = new InvestProposalCreate(id);

    proposalCreate.pool = pool;
    proposalCreate.proposalId = proposalId;

    proposalCreate.transaction = "";
  }

  return proposalCreate;
}
