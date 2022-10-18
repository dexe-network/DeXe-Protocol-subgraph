import { DistributionProposalClaimed } from "../../generated/templates/DistributionProposal/DistributionProposal";
import { getDaoPool } from "../entities/DaoPool";
import { getProposal } from "../entities/Proposal";
import { getVoter } from "../entities/Voters/Voter";
import { getVoterInPool } from "../entities/Voters/VoterInPool";
import { getVoterInProposal } from "../entities/Voters/VoterInProposal";
import { extendArray } from "../helpers/ArrayHelper";

export function onDistributionProposalClaimed(event: DistributionProposalClaimed): void {
  let voter = getVoter(event.params.sender);
  let pool = getDaoPool(event.address, event.block.timestamp, event.block.number);
  let voterInPool = getVoterInPool(pool, voter);
  let proposal = getProposal(pool, event.params.proposalId);

  voterInPool.claimedDPs = extendArray(voterInPool.claimedDPs, [proposal.id]);

  proposal.save();
  voterInPool.save();
  pool.save();
  voter.save();
}
