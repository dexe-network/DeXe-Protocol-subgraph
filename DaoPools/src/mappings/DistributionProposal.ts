import { Address } from "@graphprotocol/graph-ts";
import { DistributionProposalClaimed } from "../../generated/templates/DistributionProposal/DistributionProposal";
import { getDaoPool } from "../entities/DaoPool";
import { getDPContract } from "../entities/DPContract";
import { getProposal } from "../entities/Proposal";
import { getVoter } from "../entities/Voters/Voter";
import { getVoterInPool } from "../entities/Voters/VoterInPool";
import { extendArray } from "../helpers/ArrayHelper";

export function onDistributionProposalClaimed(event: DistributionProposalClaimed): void {
  let dpToPool = getDPContract(event.address);
  let voter = getVoter(event.params.sender);
  let pool = getDaoPool(Address.fromString(dpToPool.daoPool.toHexString()));
  let voterInPool = getVoterInPool(pool, voter);
  let proposal = getProposal(pool, event.params.proposalId);

  voterInPool.claimedDPs = extendArray(voterInPool.claimedDPs, [proposal.id]);

  proposal.save();
  voterInPool.save();
  pool.save();
  voter.save();
}
