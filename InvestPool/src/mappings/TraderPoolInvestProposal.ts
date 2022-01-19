import {
  ProposalCreated,
  ProposalDivested,
  ProposalInvested,
  ProposalWithdrawn,
  ProposalSupplied,
} from "../../generated/templates/InvestProposal/InvestProposal";
import { getInvestorInfo } from "../entities/invest-pool/InvestorInfo";
import { getProposalDivestHistory } from "../entities/invest-pool/proposal/history/ProposalDivestHistory";
import { getProposalInvestHistory } from "../entities/invest-pool/proposal/history/ProposalInvestHistory";
import { getProposalSupplyHistory } from "../entities/invest-pool/proposal/history/ProposalSupplyHistory";
import { getProposalWithdrawHistory } from "../entities/invest-pool/proposal/history/ProposalWithdrawHistory";
import { getProposalDivest } from "../entities/invest-pool/proposal/ProposalDivest";
import { getProposalInvest } from "../entities/invest-pool/proposal/ProposalInvest";
import { getProposalInvestPool } from "../entities/invest-pool/proposal/ProposalInvestPool";
import { getProposalSupply } from "../entities/invest-pool/proposal/ProposalSupply";
import { getProposalWithdraw } from "../entities/invest-pool/proposal/ProposalWithdraw";

export function onProposalCreated(event: ProposalCreated): void {
  let proposal = getProposalInvestPool(
    event.params.index,
    event.address,
    event.params.proposalLimits[0].toBigInt(),
    event.params.proposalLimits[1].toBigInt()
  );
  proposal.save();
}

export function onProposalInvest(event: ProposalInvested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let proposal = getProposalInvestPool(event.params.index, event.address);
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
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let proposal = getProposalInvestPool(event.params.index, event.address);
  let divest = getProposalDivest(event.transaction.hash, event.params.amount, investorInfo.id);
  let history = getProposalDivestHistory(event.block.timestamp, proposal.id);

  divest.day = history.id;
  history.totalDivestVolume = history.totalDivestVolume.plus(event.params.amount);

  proposal.save();
  divest.save();
  history.save();
}

export function onWithdrawn(event: ProposalWithdrawn): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let withdraw = getProposalWithdraw(event.transaction.hash, event.params.amount, investorInfo.id);
  let proposal = getProposalInvestPool(event.params.index, event.address);
  let history = getProposalWithdrawHistory(event.block.timestamp, proposal.id);

  withdraw.day = history.id;
  history.totalWithdraw = history.totalWithdraw.plus(event.params.amount);

  proposal.save();
  withdraw.save();
  history.save();
}

export function onSupplied(event: ProposalSupplied): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let supply = getProposalSupply(event.transaction.hash, event.params.amount, investorInfo.id);
  let proposal = getProposalInvestPool(event.params.index, event.address);
  let history = getProposalSupplyHistory(event.block.timestamp, proposal.id);

  supply.day = history.id;
  history.totalSupply = history.totalSupply.plus(event.params.amount);

  proposal.save();
  supply.save();
  history.save();
}
