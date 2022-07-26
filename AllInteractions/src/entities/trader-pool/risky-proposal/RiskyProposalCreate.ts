import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { RiskyProposalCreate } from "../../../../generated/schema";

export function getRiskyProposalCreate(
  hash: Bytes,
  pool: Bytes,
  proposalId: BigInt,
  token: Address,
  count: BigInt
): RiskyProposalCreate {
  let id = hash.concatI32(count.toI32());
  let riskyProposalCreate = RiskyProposalCreate.load(id);

  if (riskyProposalCreate == null) {
    riskyProposalCreate = new RiskyProposalCreate(id);

    riskyProposalCreate.pool = pool;
    riskyProposalCreate.proposalId = proposalId;
    riskyProposalCreate.token = token;

    riskyProposalCreate.transaction = Bytes.empty();
  }

  return riskyProposalCreate;
}
