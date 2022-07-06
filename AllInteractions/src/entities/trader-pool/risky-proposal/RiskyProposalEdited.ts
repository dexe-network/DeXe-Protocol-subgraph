import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalEdit } from "../../../../generated/schema";

export function getRiskyProposalEdited(hash: Bytes, proposalId: BigInt, pool: Bytes): ProposalEdit {
  let edit = ProposalEdit.load(hash);

  if (edit == null) {
    edit = new ProposalEdit(hash);

    edit.pool = pool;
    edit.proposalId = proposalId;

    edit.transaction = Bytes.empty();
  }

  return edit;
}
