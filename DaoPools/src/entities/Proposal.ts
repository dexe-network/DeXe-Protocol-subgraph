import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPool, Proposal } from "../../generated/schema";

export function getProposal(
  pool: DaoPool,
  proposalId: BigInt,
  creator: Address = Address.zero(),
  quorum: BigInt = BigInt.zero(),
  description: string = "",
  rewardToken: Address = Address.zero()
): Proposal {
  let id = pool.id.concatI32(proposalId.toI32());
  let proposal = Proposal.load(id);

  if (proposal == null) {
    proposal = new Proposal(id);

    proposal.proposalId = proposalId;

    proposal.creator = creator;

    proposal.isFor = false;
    proposal.executor = Bytes.empty();
    proposal.executionTimestamp = BigInt.zero();
    proposal.quorumReachedTimestamp = BigInt.zero();

    proposal.rewardToken = rewardToken;

    proposal.currentVotesFor = BigInt.zero();
    proposal.currentVotesAgainst = BigInt.zero();
    proposal.quorum = quorum;

    proposal.description = description;

    proposal.votersVoted = BigInt.zero();
    proposal.voters = new Array<Bytes>();

    proposal.pool = pool.id;
    proposal.settings = Bytes.empty();
  }

  return proposal;
}
