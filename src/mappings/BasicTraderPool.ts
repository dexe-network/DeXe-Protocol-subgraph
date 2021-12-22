import { Exchanged, PositionClosed, InvestorAdded, Invest, InvestorRemoved, Divest } from "../../generated/templates/BasicPool/BasicPool"
import { getBasicTraderPool } from "../entities/basic-pool/BasicTraderPool";
import { getPositionOffset } from "../entities/global/PositionOffset";
import { getPositionInBasicPool } from "../entities/basic-pool/PositionInBasicPool";
import { getExchangeInBasicPool } from "../entities/basic-pool/ExchangeInBasicPool";
import { getInvestInBasicPool } from "../entities/basic-pool/InvestInBasicPool";
import { BigInt } from "@graphprotocol/graph-ts";
import { getPositionId } from "../helpers/Position";
import { getInvestHistoryInBasicPool } from "../entities/basic-pool/history/InvestHistoryInBasicPool";
import { getExchangeHistoryInBasicPool } from "../entities/basic-pool/history/ExchangeHistoryInBasicPool";
import { getInvestorBasicPool } from "../entities/basic-pool/InvestorBasicPool";
import { getDivestInBasicPool } from "../entities/basic-pool/DivestInBasicPool";
import { getDivestHistoryInBasicPool } from "../entities/basic-pool/history/DivestHistoryInBasicPool";

export function onExchange(event: Exchanged): void {
  let basicPool = getBasicTraderPool(event.address);

  let position = getPositionInBasicPool(getPositionId(getBasicTraderPool(event.address).id, event.params.toToken), event.address, event.params.toToken);

  let trade = getExchangeInBasicPool(
    event.transaction.hash,
    event.params.fromToken,
    event.params.toToken,
    event.params.volume,
    event.params.priceInBase,
    position.id
  );

  if (trade.toToken != basicPool.baseToken) { 
    // adding funds to the position
    // let fullOldPrice = position.averagePositionPriceInBase.times(position.totalOpenVolume);
    // let fullNewPrice = trade.volume.times(trade.priceInBase);
     let fullVolume = position.totalOpenVolume.plus(trade.toVolume);    
    // let newAveragePrice = fullOldPrice.plus(fullNewPrice).div(fullVolume);

    //position.averagePositionPriceInBase = newAveragePrice;
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

  let investor = getInvestorBasicPool(event.params.investor,event.address);
  investor.save();
}

export function onInvest(event: Invest): void {
  let invest = getInvestInBasicPool(event.transaction.hash, event.params.investor, event.params.amount, event.params.lpPurchasePrice);
  let history = getInvestHistoryInBasicPool(event.block.timestamp,event.address);
  let investor = getInvestorBasicPool(event.params.investor,event.address);
  
  history.totalInvestVolume = history.totalInvestVolume.plus(event.params.amount);
  investor.totalInvestVolume = investor.totalInvestVolume.plus(event.params.amount);
  
  invest.day = history.id;

  investor.save();
  invest.save();
  history.save();
}

export function onInvestorRemoved(event: InvestorRemoved): void {
  let history = getDivestHistoryInBasicPool(event.block.timestamp, event.address);
  history.quitInvestors = history.quitInvestors.plus(BigInt.fromI32(1));
  history.save();
}

export function onDivest(event: Divest): void {
  let divest = getDivestInBasicPool(event.transaction.hash, event.params.investor, event.params.amount);
  let history = getDivestHistoryInBasicPool(event.block.timestamp, event.address);
  let investor = getInvestorBasicPool(event.params.investor);
  
  investor.totalDivestVolume = investor.totalDivestVolume.plus(event.params.amount);
  history.totalDivestVolume = history.totalDivestVolume.plus(event.params.amount);
  divest.day = history.id;

  investor.save();
  divest.save();
  history.save();
}
