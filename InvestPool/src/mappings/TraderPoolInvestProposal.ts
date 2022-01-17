import {
  ProposalCreated,
  ProposalDivest,
  ProposalExchange,
  ProposalInvest,
} from "../../generated/templates/InvestPool/InvestPool";
import { getInvestorInfo } from "../entities/invest-pool/InvestorInfo";
import { getProposalDivestHistoryInInvestPool } from "../entities/invest-pool/proposal/history/ProposalDivestHistoryInInvestPool";
import { getProposalExchangeHistoryInInvestPool } from "../entities/invest-pool/proposal/history/ProposalExchangeHistoryInInvestPool";
import { getProposalInvestHistoryInInvestPool } from "../entities/invest-pool/proposal/history/ProposalInvestHistoryInInvestPool";
import { getProposalDivestInInvestPool } from "../entities/invest-pool/proposal/ProposalDivestInInvestPool";
import { getProposalExchangeInInvestPool } from "../entities/invest-pool/proposal/ProposalExchangeInInvestPool";
import { getProposalInvestInInvestPool } from "../entities/invest-pool/proposal/ProposalInvestInInvestPool";
import { getProposalInvestPool } from "../entities/invest-pool/proposal/ProposalInvestPool";

export function onProposalCreated(event: ProposalCreated): void {
  let proposal = getProposalInvestPool(
    event.params.index,
    event.address,
    event.params.token,
    event.params.proposalLimits[0].toBigInt(),
    event.params.proposalLimits[1].toBigInt()
  );
  proposal.save();
}

export function onProposalInvest(event: ProposalInvest): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let proposal = getProposalInvestPool(event.params.index, event.address);
  let invest = getProposalInvestInInvestPool(
    event.transaction.hash,
    event.params.amountLP,
    event.params.amountBase,
    investorInfo.id
  );
  let history = getProposalInvestHistoryInInvestPool(event.block.timestamp, proposal.id);

  invest.day = history.id;

  history.totalInvestVolumeBase = history.totalInvestVolumeBase.plus(event.params.amountBase);
  history.totalInvestVolumeLP = history.totalInvestVolumeLP.plus(event.params.amountLP);

  proposal.save();
  invest.save();
  history.save();
}

export function onProposalDivest(event: ProposalDivest): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let proposal = getProposalInvestPool(event.params.index, event.address);
  let divest = getProposalDivestInInvestPool(
    event.transaction.hash,
    event.params.amount,
    event.params.commission,
    investorInfo.id
  );
  let history = getProposalDivestHistoryInInvestPool(event.block.timestamp, proposal.id);

  divest.day = history.id;

  proposal.save();
  divest.save();
  history.save();
}

export function onProposalExchange(event: ProposalExchange): void {
  let proposal = getProposalInvestPool(event.params.index, event.address);
  let exchange = getProposalExchangeInInvestPool(
    event.transaction.hash,
    event.params.fromToken,
    event.params.toToken,
    event.params.fromVolume,
    event.params.toVolume
  );
  let history = getProposalExchangeHistoryInInvestPool(event.block.timestamp, proposal.id);

  exchange.day = history.id;

  proposal.save();
  exchange.save();
  history.save();
}
