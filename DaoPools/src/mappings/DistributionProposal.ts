import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { PriceFeed } from "../../generated/templates/DistributionProposal/PriceFeed";
import { DistributionProposalClaimed } from "../../generated/templates/DistributionProposal/DistributionProposal";
import { getDaoPool } from "../entities/DaoPool";
import { getDPContract } from "../entities/DPContract";
import { getProposal } from "../entities/Proposal";
import { getVoter } from "../entities/Voters/Voter";
import { getVoterInPool } from "../entities/Voters/VoterInPool";
import { extendArray } from "../helpers/ArrayHelper";
import { BNB_ADDRESS, PRICE_FEED_ADDRESS, WBNB_ADDRESS } from "../entities/global/globals";
import { getDistributionProposal } from "../entities/DistributionProposal";
import { getVoterInProposal } from "../entities/Voters/VoterInProposal";
import { getUSDValue } from "../helpers/PriceFeedInteractions";

export function onDistributionProposalClaimed(event: DistributionProposalClaimed): void {
  let dpToPool = getDPContract(event.address);
  let voter = getVoter(event.params.sender);
  let pool = getDaoPool(Address.fromBytes(dpToPool.daoPool));
  let voterInPool = getVoterInPool(pool, voter);
  let proposal = getProposal(pool, event.params.proposalId);
  let dp = getDistributionProposal(proposal);
  let voterInProposal = getVoterInProposal(proposal, voterInPool);

  let usdAmount = getUSDValue(
    Address.fromBytes(dp.token).equals(Address.fromString(BNB_ADDRESS))
      ? Address.fromString(WBNB_ADDRESS)
      : Address.fromBytes(dp.token),
    event.params.amount
  );

  voterInPool.claimedDPs = extendArray(voterInPool.claimedDPs, [proposal.id]);
  voterInPool.totalDPClaimed = voterInPool.totalDPClaimed.plus(usdAmount);
  voterInProposal.claimedDpRewardUSD = usdAmount;

  proposal.save();
  voterInProposal.save();
  voterInPool.save();
  pool.save();
  voter.save();
}
