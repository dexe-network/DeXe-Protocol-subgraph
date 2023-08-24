import { Address } from "@graphprotocol/graph-ts";
import { pushUnique } from "@solarity/graph-lib";
import { DistributionProposalClaimed } from "../../generated/templates/DistributionProposal/DistributionProposal";
import { getDaoPool } from "../entities/DaoPool";
import { getDPContract } from "../entities/DPContract";
import { getProposal } from "../entities/Proposal";
import { getVoter } from "../entities/Voters/Voter";
import { getVoterInPool } from "../entities/Voters/VoterInPool";
import { BNB_ADDRESS, WBNB_ADDRESS } from "../entities/global/globals";
import { getVoterInProposal } from "../entities/Voters/VoterInProposal";
import { getUSDValue } from "../helpers/PriceFeedInteractions";

export function onDistributionProposalClaimed(event: DistributionProposalClaimed): void {
  let dpToPool = getDPContract(event.address);
  let voter = getVoter(event.params.sender);
  let pool = getDaoPool(Address.fromBytes(dpToPool.daoPool));
  let voterInPool = getVoterInPool(pool, voter, event.block.timestamp);
  let proposal = getProposal(pool, event.params.proposalId);
  let voterInProposal = getVoterInProposal(proposal, voterInPool);

  let usdAmount = getUSDValue(
    Address.fromBytes(event.params.token).equals(Address.fromString(BNB_ADDRESS))
      ? Address.fromString(WBNB_ADDRESS)
      : Address.fromBytes(event.params.token),
    event.params.amount
  );

  voterInPool.totalClaimedUSD = voterInPool.totalClaimedUSD.plus(usdAmount);
  voterInProposal.claimedRewardUSD = voterInProposal.claimedRewardUSD.plus(usdAmount);

  voter.totalClaimedUSD = voter.totalClaimedUSD.plus(usdAmount);

  proposal.save();
  voterInProposal.save();
  voterInPool.save();
  pool.save();
  voter.save();
}
