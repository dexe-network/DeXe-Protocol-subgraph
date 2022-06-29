import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { RiskyProposalCreate } from "../../../../generated/schema";

export function getRiskyProposalCreate(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  token: Address
): RiskyProposalCreate {
  let id = hash.toHexString();
  let riskyProposalCreate = RiskyProposalCreate.load(id);

  if (riskyProposalCreate == null) {
    riskyProposalCreate = new RiskyProposalCreate(id);

    riskyProposalCreate.pool = pool;
    riskyProposalCreate.proposalId = proposalId;
    riskyProposalCreate.token = token;

    riskyProposalCreate.transaction = "";
  }

  return riskyProposalCreate;
}
