import { BigInt } from "@graphprotocol/graph-ts";
import { ValidatorInPool, ValidatorInProposal } from "../../generated/schema";

export function getValidatorInProposal(validator: ValidatorInPool, proposalId: BigInt): ValidatorInProposal {
  let id = validator.id.concatI32(proposalId.toI32());
  let validatorInProposal = ValidatorInProposal.load(id);

  if (validatorInProposal == null) {
    validatorInProposal = new ValidatorInProposal(id);
    validatorInProposal.pool = validator.pool;
    validatorInProposal.proposalId = proposalId;
    validatorInProposal.totalVote = BigInt.zero();

    validatorInProposal.validator = validator.id;
  }

  return validatorInProposal;
}
