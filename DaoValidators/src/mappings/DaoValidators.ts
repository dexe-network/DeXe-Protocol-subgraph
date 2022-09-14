import { Address } from "@graphprotocol/graph-ts";
import { ValidatorInPool } from "../../generated/schema";
import { ChangedValidatorsBalances, Voted } from "../../generated/templates/DaoValidators/DaoValidators";
import { getDaoPool } from "../entities/DaoPool";
import { getProposalVote } from "../entities/ProposalVote";
import { getValidatorContract } from "../entities/ValidatorContract";
import { getValidatorInPool } from "../entities/ValidatorInPool";
import { getValidatorInProposal } from "../entities/ValidatorInProposal";

export function onVoted(event: Voted): void {
  let pool = getDaoPool(Address.fromBytes(getValidatorContract(event.address).pool));
  let validatorInPool = getValidatorInPool(pool, event.params.sender);
  let validatorInProposal = getValidatorInProposal(validatorInPool, event.params.proposalId);
  let vote = getProposalVote(
    event.transaction.hash,
    event.block.timestamp,
    event.params.proposalId,
    event.params.vote,
    validatorInProposal
  );

  validatorInProposal.totalVote = validatorInProposal.totalVote.plus(event.params.vote);

  vote.save();
  validatorInProposal.save();
  validatorInPool.save();
  pool.save();
}

export function onChangedValidatorsBalances(event: ChangedValidatorsBalances): void {
  let pool = getDaoPool(Address.fromBytes(getValidatorContract(event.address).pool));
  let validatorInPool: ValidatorInPool;

  for (let i = 0; i < event.params.validators.length; i++) {
    validatorInPool = getValidatorInPool(pool, event.params.validators[i]);
    validatorInPool.balance = event.params.newBalance[i];
    validatorInPool.save();
  }
  pool.save();
}
