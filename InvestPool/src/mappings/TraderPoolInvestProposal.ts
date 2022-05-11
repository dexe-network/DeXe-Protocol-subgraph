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
import { getProposalWithdrawalHistory } from "../entities/invest-pool/proposal/history/ProposalWithdrawalHistory";
import { getProposalDivest } from "../entities/invest-pool/proposal/ProposalDivest";
import { getProposalInvest } from "../entities/invest-pool/proposal/ProposalInvest";
import { getProposal } from "../entities/invest-pool/proposal/Proposal";
import { getProposalSupply } from "../entities/invest-pool/proposal/ProposalSupply";
import { getProposalWithdrawal } from "../entities/invest-pool/proposal/ProposalWithdrawal";

export function onProposalCreated(event: ProposalCreated): void {
  let proposal = getProposal(
    event.params.index,
    event.address,
    event.params.proposalLimits[0].toBigInt(),
    event.params.proposalLimits[1].toBigInt()
  );
  proposal.save();
}

export function onProposalInvested(event: ProposalInvested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let proposal = getProposal(event.params.index, event.address);
  let invest = getProposalInvest(
    event.transaction.hash,
    event.params.amountLP,
    event.params.amountBase,
    investorInfo.id,
    event.block.timestamp
  );
  let history = getProposalInvestHistory(event.block.timestamp, proposal.id);

  invest.day = history.id;

  history.totalInvestVolumeBase = history.totalInvestVolumeBase.plus(event.params.amountBase);
  history.totalInvestVolumeLP = history.totalInvestVolumeLP.plus(event.params.amountLP);

  proposal.save();
  invest.save();
  history.save();
  investorInfo.save();
}

export function onProposalDivested(event: ProposalDivested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let proposal = getProposal(event.params.index, event.address);
  let divest = getProposalDivest(event.transaction.hash, event.params.amount, investorInfo.id, event.block.timestamp);
  let history = getProposalDivestHistory(event.block.timestamp, proposal.id);

  divest.day = history.id;
  history.totalDivestVolume = history.totalDivestVolume.plus(event.params.amount);

  proposal.save();
  divest.save();
  history.save();
  investorInfo.save();
}

export function onWithdrawn(event: ProposalWithdrawn): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let withdraw = getProposalWithdrawal(
    event.transaction.hash,
    event.params.amount,
    investorInfo.id,
    event.block.timestamp
  );
  let proposal = getProposal(event.params.index, event.address);
  let history = getProposalWithdrawalHistory(event.block.timestamp, proposal.id);

  withdraw.day = history.id;
  history.totalWithdrawal = history.totalWithdrawal.plus(event.params.amount);

  proposal.save();
  withdraw.save();
  history.save();
  investorInfo.save();
}

export function onSupplied(event: ProposalSupplied): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let supply = getProposalSupply(
    event.transaction.hash,
    event.params.amount,
    event.params.token,
    investorInfo.id,
    event.block.timestamp
  );
  let proposal = getProposal(event.params.index, event.address);
  let history = getProposalSupplyHistory(event.block.timestamp, proposal.id);

  supply.day = history.id;

  let tokenArr = history.tokens;
  let index = tokenArr.indexOf(event.params.token);
  let amountsArr = history.totalAmounts;

  if (index == -1) {
    tokenArr.push(event.params.token);
    history.tokens = tokenArr;
    amountsArr.push(event.params.amount);
  } else {
    amountsArr[index].plus(event.params.amount);
  }

  history.totalAmounts = amountsArr;

  proposal.save();
  supply.save();
  history.save();
  investorInfo.save();
}
