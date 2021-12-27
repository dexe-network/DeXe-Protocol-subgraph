import { Exchanged, PositionClosed, InvestorAdded, Invest, InvestorRemoved, Divest, ProposalCreated, ProposalInvest, ProposalDivest, ProposalExchange } from "../../generated/templates/BasicPool/BasicPool"
import { getBasicTraderPool } from "../entities/basic-pool/BasicTraderPool";
import { getPositionOffset } from "../entities/global/PositionOffset";
import { getPositionInBasicPool } from "../entities/basic-pool/PositionInBasicPool";
import { getExchangeInBasicPool } from "../entities/basic-pool/ExchangeInBasicPool";
import { getInvestInBasicPool } from "../entities/basic-pool/InvestInBasicPool";
import { BigInt } from "@graphprotocol/graph-ts";
import { getPositionId } from "../helpers/Position";
import { getInvestHistoryInBasicPool } from "../entities/basic-pool/history/InvestHistoryInBasicPool";
import { getExchangeHistoryInBasicPool } from "../entities/basic-pool/history/ExchangeHistoryInBasicPool";
import { getInvestorInBasicPool } from "../entities/basic-pool/InvestorInBasicPool";
import { getDivestInBasicPool } from "../entities/basic-pool/DivestInBasicPool";
import { getDivestHistoryInBasicPool } from "../entities/basic-pool/history/DivestHistoryInBasicPool";
import { getProposalBasicPool } from "../entities/basic-pool/proposal/ProposalBasicPool";
import { getProposalInvestInBasicPool } from "../entities/basic-pool/proposal/ProposalInvestInBasicPool";
import { getProposalInvestHistoryInBasicPool } from "../entities/basic-pool/proposal/history/ProposalInvestHistoryInBasicPool";
import { getProposalDivestHistoryInBasicPool } from "../entities/basic-pool/proposal/history/ProposalDivestHistoryInBasicPool";
import { getProposalExchangeHistoryInBasicPool } from "../entities/basic-pool/proposal/history/ProposalExchangeHistoryInBasicPool";
import { getProposalExchangeInBasicPool } from "../entities/basic-pool/proposal/ProposalExchangeInBasicPool";
import { getInvestorInfo } from "../entities/basic-pool/InvestorInfo";
import { removeByIndex } from "../helpers/ArrayHelper";
import { getBasicPoolHistory } from "../entities/basic-pool/BasicPoolHistory";

export function onExchange(event: Exchanged): void {
  let basicPool = getBasicTraderPool(event.address);

  let position = getPositionInBasicPool(getPositionId(getBasicTraderPool(event.address).id, event.params.toToken), event.address, event.params.toToken);

  let trade = getExchangeInBasicPool(
    event.transaction.hash,
    position.id,
    event.params.fromToken,
    event.params.toToken,
    event.params.fromVolume,
    event.params.toVolume,
  );

  if (trade.toToken != basicPool.baseToken) { 
    // adding funds to the position
    let fullVolume = position.totalOpenVolume.plus(trade.toVolume);    
    position.totalOpenVolume = fullVolume;
  } else if (trade.fromToken != basicPool.baseToken) {
    // withdrawing funds from the position
    position.totalCloseVolume = position.totalCloseVolume.plus(trade.toVolume);
  }

  let history = getExchangeHistoryInBasicPool(event.block.timestamp,event.address);
  trade.day = history.id;

  basicPool.save();
  position.save();
  trade.save();
  history.save();
}

export function onClose(event: PositionClosed): void {
  let positionOffset = getPositionOffset(getBasicTraderPool(event.address).id, event.params.position);
  let position = getPositionInBasicPool(getPositionId(getBasicTraderPool(event.address).id, event.params.position), event.address, event.params.position);
  
  position.closed = true;
  positionOffset.offset = positionOffset.offset.plus(BigInt.fromI32(1));

  position.save();
  positionOffset.save();
}

export function onInvestorAdded(event: InvestorAdded): void {
  let history = getInvestHistoryInBasicPool(event.block.timestamp,event.address);
  history.newInvestors = history.newInvestors.plus(BigInt.fromI32(1));
  history.save();

  let investor = getInvestorInBasicPool(event.params.investor,event.address);
  let basicPool = getBasicTraderPool(event.address);
  investor.activePools.push(basicPool.id);
  investor.allPools.push(basicPool.id);
  investor.save();

  let basicPoolHistory = getBasicPoolHistory(event.block.timestamp, event.address);
  basicPoolHistory.investorsCount = basicPoolHistory.investorsCount.plus(BigInt.fromI32(1));
  basicPoolHistory.save();
}

export function onInvest(event: Invest): void {
  let investorInfo = getInvestorInfo(event.params.investor,event.address);
  let invest = getInvestInBasicPool(event.transaction.hash, investorInfo.id, event.params.amount, event.params.lpPurchasePrice);
  let history = getInvestHistoryInBasicPool(event.block.timestamp,event.address);
  
  history.totalInvestVolume = history.totalInvestVolume.plus(event.params.amount);
  investorInfo.totalInvestVolume = investorInfo.totalInvestVolume.plus(event.params.amount);
  
  invest.day = history.id;

  investorInfo.save();
  invest.save();
  history.save();
}

export function onInvestorRemoved(event: InvestorRemoved): void {
  let history = getDivestHistoryInBasicPool(event.block.timestamp, event.address);
  history.quitInvestors = history.quitInvestors.plus(BigInt.fromI32(1));
  history.save();

  let investor = getInvestorInBasicPool(event.params.investor,event.address);
  let basicPool = getBasicTraderPool(event.address);
  investor.activePools = removeByIndex(investor.activePools,investor.activePools.indexOf(basicPool.id));
  investor.save();

  let basicPoolHistory = getBasicPoolHistory(event.block.timestamp, event.address);
  basicPoolHistory.investorsCount = basicPoolHistory.investorsCount.minus(BigInt.fromI32(1));
  basicPoolHistory.save();
}

export function onDivest(event: Divest): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let divest = getDivestInBasicPool(event.transaction.hash, investorInfo.id, event.params.amount);
  let history = getDivestHistoryInBasicPool(event.block.timestamp, event.address);
  
  
  investorInfo.totalDivestVolume = investorInfo.totalDivestVolume.plus(event.params.amount);
  history.totalDivestVolume = history.totalDivestVolume.plus(event.params.amount);
  divest.day = history.id;

  investorInfo.save();
  divest.save();
  history.save();
}

export function onProposalCreated(event:ProposalCreated):void{
  let proposal = getProposalBasicPool(event.params.index,event.address,event.params.token,event.params.proposalLimits[0].toBigInt(),event.params.proposalLimits[1].toBigInt(),event.params.proposalLimits[2].toBigInt());
  proposal.save();
}

export function onProposalInvest(event: ProposalInvest):void{
  let investorInfo = getInvestorInfo(event.params.investor,event.address);
  let proposal = getProposalBasicPool(event.params.index, event.address);
  let invest = getProposalInvestInBasicPool(event.transaction.hash,event.params.amountLP,event.params.amountBase,investorInfo.id);
  let history = getProposalInvestHistoryInBasicPool(event.block.timestamp,proposal.id);
  
  invest.day = history.id;

  proposal.save();
  invest.save();
  history.save();
}

export function onProposalDivest(event: ProposalDivest):void{
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let proposal = getProposalBasicPool(event.params.index,event.address);
  let divest = getDivestInBasicPool(event.transaction.hash,investorInfo.id,event.params.amount,event.params.commission);
  let history = getProposalDivestHistoryInBasicPool(event.block.timestamp, proposal.id);

  divest.day = history.id;

  proposal.save();
  divest.save();
  history.save();
}

export function onProposalExchange(event:ProposalExchange): void {
  let proposal = getProposalBasicPool(event.params.index, event.address);
  let exchange = getProposalExchangeInBasicPool(event.transaction.hash,event.params.fromToken,event.params.toToken,event.params.fromVolume,event.params.toVolume);
  let history = getProposalExchangeHistoryInBasicPool(event.block.timestamp,proposal.id);

  exchange.day = history.id;

  proposal.save();
  exchange.save();
  history.save();
}