import { getInvestorInfo } from "../entities/basic-pool/InvestorInfo";
import { getProposalDivestHistory } from "../entities/basic-pool/proposal/history/ProposalDivestHistory";
import { getProposalExchangeHistory } from "../entities/basic-pool/proposal/history/ProposalExchangeHistory";
import { getProposalInvestHistory } from "../entities/basic-pool/proposal/history/ProposalInvestHistory";
import { getProposal } from "../entities/basic-pool/proposal/Proposal";
import { getProposalDivest } from "../entities/basic-pool/proposal/ProposalDivest";
import { getProposalExchange } from "../entities/basic-pool/proposal/ProposalExchange";
import { getProposalInvest } from "../entities/basic-pool/proposal/ProposalInvest";
import {
  ProposalCreated,
  ProposalDivested,
  ProposalExchanged,
  ProposalInvested,
} from "../../generated/templates/RiskyProposal/RiskyProposal";

export function onProposalCreated(event: ProposalCreated): void {
  let proposal = getProposal(
    event.params.index,
    event.address,
    event.params.token,
    event.params.proposalLimits[0].toBigInt(),
    event.params.proposalLimits[1].toBigInt(),
    event.params.proposalLimits[2].toBigInt()
  );
  proposal.save();
}

export function onProposalInvest(event: ProposalInvested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address, event.block.timestamp);
  let proposal = getProposal(event.params.index, event.address);
  let invest = getProposalInvest(
    event.transaction.hash,
    event.params.amountLP,
    event.params.amountBase,
    investorInfo.id
  );
  let history = getProposalInvestHistory(event.block.timestamp, proposal.id);

  invest.day = history.id;

  history.totalInvestVolumeBase = history.totalInvestVolumeBase.plus(event.params.amountBase);
  history.totalInvestVolumeLP = history.totalInvestVolumeLP.plus(event.params.amountLP);

  proposal.save();
  invest.save();
  history.save();
}

export function onProposalDivest(event: ProposalDivested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address, event.block.timestamp);
  let proposal = getProposal(event.params.index, event.address);
  let divest = getProposalDivest(
    event.transaction.hash,
    event.params.amountLP,
    event.params.amountBase,
    investorInfo.id
  );
  let history = getProposalDivestHistory(event.block.timestamp, proposal.id);

  divest.day = history.id;

  history.totalDivestVolumeBase = history.totalDivestVolumeBase.plus(event.params.amountBase);
  history.totalDivestVolumeLP = history.totalDivestVolumeLP.plus(event.params.amountLP);

  proposal.save();
  divest.save();
  history.save();
}

export function onProposalExchange(event: ProposalExchanged): void {
  let proposal = getProposal(event.params.index, event.address);
  let exchange = getProposalExchange(
    event.transaction.hash,
    event.params.fromToken,
    event.params.toToken,
    event.params.fromVolume,
    event.params.toVolume
  );
  let history = getProposalExchangeHistory(event.block.timestamp, proposal.id);

  exchange.day = history.id;
  if (event.params.toToken != proposal.token) {
    // adding funds to the position
    proposal.totalOpenVolume = proposal.totalOpenVolume.plus(event.params.toVolume);
  } else if (event.params.fromToken != proposal.token) {
    // withdrawing funds from the position
    proposal.totalCloseVolume = proposal.totalCloseVolume.plus(event.params.toVolume);
  }

  proposal.save();
  exchange.save();
  history.save();
}
