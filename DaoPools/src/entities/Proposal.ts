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
    proposal.executor = Bytes.empty();
    proposal.executionTimestamp = BigInt.zero();
    proposal.currentVotes = BigInt.zero();
    proposal.quorum = quorum;
    proposal.votersVoted = BigInt.zero();
    proposal.isDP = false;
    proposal.settings = Bytes.empty();
    proposal.voters = new Array<Bytes>();
    proposal.description = description;
    proposal.votesCount = BigInt.zero();
    proposal.rewardToken = rewardToken;

    proposal.pool = pool.id;
  }

  return proposal;
}
