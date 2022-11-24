import { BigInt } from "@graphprotocol/graph-ts";
import { Proposal, ValidatorInPool, ValidatorInProposal } from "../../generated/schema";

export function getValidatorInProposal(validator: ValidatorInPool, proposal: Proposal): ValidatorInProposal {
  let id = validator.id.concatI32(proposal.proposalId.toI32());
  let validatorInProposal = ValidatorInProposal.load(id);

  if (validatorInProposal == null) {
    validatorInProposal = new ValidatorInProposal(id);
    validatorInProposal.pool = validator.pool;
    validatorInProposal.proposal = proposal.id;
    validatorInProposal.totalVote = BigInt.zero();

    validatorInProposal.validator = validator.id;
  }

  return validatorInProposal;
}
