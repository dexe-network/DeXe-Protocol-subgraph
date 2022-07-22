import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalEdit } from "../../../../generated/schema";

export function getRiskyProposalEdited(hash: Bytes, proposalId: BigInt, pool: Bytes, count: BigInt): ProposalEdit {
  let id = hash.concatI32(count.toI32());
  let edit = ProposalEdit.load(id);

  if (edit == null) {
    edit = new ProposalEdit(id);

    edit.pool = pool;
    edit.proposalId = proposalId;

    edit.transaction = Bytes.empty();
  }

  return edit;
}
