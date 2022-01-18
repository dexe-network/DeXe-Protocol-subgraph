import { getInvestorInfo } from "../entities/basic-pool/InvestorInfo";
import { getProposalDivestHistoryInBasicPool } from "../entities/basic-pool/proposal/history/ProposalDivestHistoryInBasicPool";
import { getProposalExchangeHistoryInBasicPool } from "../entities/basic-pool/proposal/history/ProposalExchangeHistoryInBasicPool";
import { getProposalInvestHistoryInBasicPool } from "../entities/basic-pool/proposal/history/ProposalInvestHistoryInBasicPool";
import { getProposalBasicPool } from "../entities/basic-pool/proposal/ProposalBasicPool";
import { getProposalDivestInBasicPool } from "../entities/basic-pool/proposal/ProposalDivestInBasicPool";
import { getProposalExchangeInBasicPool } from "../entities/basic-pool/proposal/ProposalExchangeInBasicPool";
import { getProposalInvestInBasicPool } from "../entities/basic-pool/proposal/ProposalInvestInBasicPool";
import {
  ProposalCreated,
  ProposalDivested,
  ProposalExchanged,
  ProposalInvested,
} from "../../generated/templates/RiskyProposal/RiskyProposal";
import { getBasicTraderPool } from "../entities/basic-pool/BasicTraderPool";

export function onProposalCreated(event: ProposalCreated): void {
  let proposal = getProposalBasicPool(
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
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let proposal = getProposalBasicPool(event.params.index, event.address);
  let invest = getProposalInvestInBasicPool(
    event.transaction.hash,
    event.params.amountLP,
    event.params.amountBase,
    investorInfo.id
  );
  let history = getProposalInvestHistoryInBasicPool(event.block.timestamp, proposal.id);

  invest.day = history.id;

  history.totalInvestVolumeBase = history.totalInvestVolumeBase.plus(event.params.amountBase);
  history.totalInvestVolumeLP = history.totalInvestVolumeLP.plus(event.params.amountLP);

  proposal.save();
  invest.save();
  history.save();
}

export function onProposalDivest(event: ProposalDivested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let proposal = getProposalBasicPool(event.params.index, event.address);
  let divest = getProposalDivestInBasicPool(
    event.transaction.hash,
    event.params.amountLP,
    event.params.amountBase,
    investorInfo.id
  );
  let history = getProposalDivestHistoryInBasicPool(event.block.timestamp, proposal.id);

  divest.day = history.id;

  history.totalDivestVolumeBase = history.totalDivestVolumeBase.plus(event.params.amountBase);
  history.totalDivestVolumeLP = history.totalDivestVolumeLP.plus(event.params.amountLP);

  proposal.save();
  divest.save();
  history.save();
}

export function onProposalExchange(event: ProposalExchanged): void {
  let proposal = getProposalBasicPool(event.params.index, event.address);
  let exchange = getProposalExchangeInBasicPool(
    event.transaction.hash,
    event.params.fromToken,
    event.params.toToken,
    event.params.fromVolume,
    event.params.toVolume
  );
  let history = getProposalExchangeHistoryInBasicPool(event.block.timestamp, proposal.id);

  exchange.day = history.id;

  proposal.save();
  exchange.save();
  history.save();
}
