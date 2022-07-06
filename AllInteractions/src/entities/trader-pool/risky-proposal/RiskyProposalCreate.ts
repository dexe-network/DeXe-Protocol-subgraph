import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { RiskyProposalCreate } from "../../../../generated/schema";

export function getRiskyProposalCreate(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  token: Address
): RiskyProposalCreate {
  let riskyProposalCreate = RiskyProposalCreate.load(hash);

  if (riskyProposalCreate == null) {
    riskyProposalCreate = new RiskyProposalCreate(hash);

    riskyProposalCreate.pool = pool;
    riskyProposalCreate.proposalId = proposalId;
    riskyProposalCreate.token = token;

    riskyProposalCreate.transaction = Bytes.empty();
  }

  return riskyProposalCreate;
}
