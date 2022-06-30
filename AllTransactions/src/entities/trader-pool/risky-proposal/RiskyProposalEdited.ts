import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalEdit } from "../../../../generated/schema";

export function getRiskyProposalEdited(hash: Bytes, proposalId: BigInt, pool: Bytes): ProposalEdit {
  let edit = ProposalEdit.load(hash.toHexString());

  if (edit == null) {
    edit = new ProposalEdit(hash.toHexString());

    edit.pool = pool;
    edit.proposalId = proposalId;

    edit.transaction = "";
  }

  return edit;
}
