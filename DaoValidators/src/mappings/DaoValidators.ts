import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ValidatorInPool } from "../../generated/schema";
import {
  ChangedValidatorsBalances,
  ExternalProposalCreated,
  InternalProposalCreated,
  InternalProposalExecuted,
  VoteCanceled,
  Voted,
} from "../../generated/templates/DaoValidators/DaoValidators";
import { getDaoPool } from "../entities/DaoPool";
import { getProposal } from "../entities/Proposal";
import { getProposalInteraction } from "../entities/ProposalInteraction";
import { getValidatorContract } from "../entities/ValidatorContract";
import { getValidatorInPool } from "../entities/ValidatorInPool";
import { getValidatorInProposal } from "../entities/ValidatorInProposal";
import { ProposalInteractionType, getEnumBigInt } from "../entities/global/ProposalInteractionTypeEnum";

export function onExternalProposalCreated(event: ExternalProposalCreated): void {
  let pool = getDaoPool(Address.fromBytes(getValidatorContract(event.address).pool));
  let proposal = getProposal(pool, event.params.proposalId, false, "", event.params.quorum);

  proposal.save();
}

export function onInternalProposalCreated(event: InternalProposalCreated): void {
  let pool = getDaoPool(Address.fromBytes(getValidatorContract(event.address).pool));
  let proposal = getProposal(
    pool,
    event.params.proposalId,
    true,
    event.params.proposalDescription,
    event.params.quorum,
    event.params.sender
  );

  proposal.save();
}

export function onInternalProposalExecuted(event: InternalProposalExecuted): void {
  let pool = getDaoPool(Address.fromBytes(getValidatorContract(event.address).pool));
  let proposal = getProposal(pool, event.params.proposalId, true);

  proposal.executor = event.params.executor;

  proposal.save();
}

export function onVoted(event: Voted): void {
  let pool = getDaoPool(Address.fromBytes(getValidatorContract(event.address).pool));
  let validatorInPool = getValidatorInPool(pool, event.params.sender);
  let proposal = getProposal(pool, event.params.proposalId, event.params.isInternal);
  let validatorInProposal = getValidatorInProposal(validatorInPool, proposal);
  let interactionType = event.params.isVoteFor
    ? ProposalInteractionType.VOTE_FOR
    : ProposalInteractionType.VOTE_AGAINST;
  let vote = getProposalInteraction(
    event.transaction.hash,
    event.block.timestamp,
    proposal,
    event.params.vote,
    validatorInProposal,
    getEnumBigInt(interactionType)
  );

  if (event.params.isVoteFor) {
    validatorInProposal.totalVoteFor = validatorInProposal.totalVoteFor.plus(event.params.vote);
    proposal.totalVoteFor = proposal.totalVoteFor.plus(event.params.vote);
  } else {
    validatorInProposal.totalVoteAgainst = validatorInProposal.totalVoteAgainst.plus(event.params.vote);
    proposal.totalVoteAgainst = proposal.totalVoteAgainst.plus(event.params.vote);
  }

  vote.save();
  validatorInProposal.save();
  validatorInPool.save();
  proposal.save();
  pool.save();
}

export function onVoteCanceled(event: VoteCanceled): void {
  let pool = getDaoPool(Address.fromBytes(getValidatorContract(event.address).pool));
  let validatorInPool = getValidatorInPool(pool, event.params.sender);
  let proposal = getProposal(pool, event.params.proposalId, event.params.isInternal);
  let validatorInProposal = getValidatorInProposal(validatorInPool, proposal);
  let vote = getProposalInteraction(
    event.transaction.hash,
    event.block.timestamp,
    proposal,
    BigInt.zero(),
    validatorInProposal,
    getEnumBigInt(ProposalInteractionType.VOTE_CANCEL)
  );

  proposal.totalVoteFor = proposal.totalVoteFor.minus(validatorInProposal.totalVoteFor);
  validatorInProposal.totalVoteFor = BigInt.zero();

  proposal.totalVoteAgainst = proposal.totalVoteAgainst.minus(validatorInProposal.totalVoteAgainst);
  validatorInProposal.totalVoteAgainst = BigInt.zero();

  vote.save();
  validatorInProposal.save();
  validatorInPool.save();
  proposal.save();
  pool.save();
}

export function onChangedValidatorsBalances(event: ChangedValidatorsBalances): void {
  let pool = getDaoPool(Address.fromBytes(getValidatorContract(event.address).pool));
  let validatorInPool: ValidatorInPool;

  for (let i = 0; i < event.params.validators.length; i++) {
    validatorInPool = getValidatorInPool(pool, event.params.validators[i]);
    validatorInPool.balance = event.params.newBalance[i];

    if (validatorInPool.balance.equals(BigInt.zero())) {
      validatorInPool.pool = Bytes.empty();
    }

    validatorInPool.save();
  }
  pool.save();
}
