import { Exchanged, PositionClosed, InvestorAdded, Invest, InvestorRemoved, Divest } from "../../generated/templates/InvestPool/InvestPool"
import { getInvestTraderPool } from "../entities/InvestTraderPool";
import { getPositionOffset } from "../entities/PositionOffset";
import { getPositionInInvestPool } from "../entities/PositionInInvestPool";
import { getTradeInInvestPool } from "../entities/TradeInInvestPool";
import { getInvestment } from "../entities/Investment";
import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { getPositionId } from "../helpers/Position";
import { getInvestHistory } from "../entities/InvestHistory";
import { getExchangeInvestPoolHistory } from "../entities/ExchangeInvestPoolHistory";
import { getInvestor } from "../entities/Investor";
import { getDivestment } from "../entities/Divestment";
import { getDivestHistory } from "../entities/DivestHistory";


export function onExchange(event: Exchanged): void {
  let basicPool = getInvestTraderPool(event.params.pool);

  let position = getPositionInInvestPool(getPositionId(event.params.pool, event.params.toToken), event.params.toToken, basicPool.id);

  let trade = getTradeInInvestPool(
    event.transaction.hash.toHex(),
    event.params.fromToken,
    event.params.toToken,
    event.params.volume,
    event.params.priceInBase,
    event.block.timestamp,
    position.id
  );

  if (trade.toToken != basicPool.baseToken) { 
    // adding funds to the position
    let fullOldPrice = position.averagePositionPriceInBase.times(position.totalOpenVolume);
    let fullNewPrice = trade.volume.times(trade.priceInBase);
    let fullVolume = position.totalOpenVolume.plus(trade.volume);    
    let newAveragePrice = fullOldPrice.plus(fullNewPrice).div(fullVolume);

    position.averagePositionPriceInBase = newAveragePrice;
    position.totalOpenVolume = fullVolume;
  } else if (trade.fromToken != basicPool.baseToken) {
    // withdrawing funds from the position
    position.totalCloseVolume = position.totalCloseVolume.plus(trade.volume);
  }

  let history = getExchangeInvestPoolHistory(event.block.timestamp);
  history.exchangesCount = history.exchangesCount.plus(BigInt.fromI32(1));

  basicPool.totalTrades = basicPool.totalTrades.plus(BigInt.fromI32(1));

  basicPool.save();
  position.save();
  trade.save();
  history.save();
}

export function onClose(event: PositionClosed): void {
  let positionOffsetId = event.params.pool.toString() + event.params.position.toString();
  let positionOffset = getPositionOffset(positionOffsetId);

  positionOffset.offset = positionOffset.offset.plus(BigInt.fromI32(1));

  positionOffset.save();
}

export function onInvestorAdded(event: InvestorAdded): void {
  let history = getInvestHistory(event.block.timestamp);
  history.newInvestors = history.newInvestors.plus(BigInt.fromI32(1));
  history.save();

  let pool = getInvestTraderPool(event.params.pool);
  pool.investors.push(event.params.investor);
  pool.save();
}

export function onInvest(event: Invest): void {
  let invest = getInvestment(event.transaction.hash.toHexString(), event.params.investor, event.params.amount, event.params.lpPurchasePrice);
  let history = getInvestHistory(event.block.timestamp);
  let investor = getInvestor(event.params.investor.toHex());
  
  investor.totalInvest = investor.totalInvest.plus(event.params.amount);
  history.totalInvestVolume = history.totalInvestVolume.plus(BigInt.fromI32(1));
  history.count = history.count.plus(BigInt.fromI32(1));
  
  investor.save();
  invest.save();
  history.save();
}

export function onInvestorRemoved(event: InvestorRemoved): void {
  let history = getInvestHistory(event.block.timestamp);
  history.removedInvestors = history.removedInvestors.plus(BigInt.fromI32(1));
  history.save();
}

export function onDivest(event: Divest): void {
  let divest = getDivestment(event.transaction.hash.toHexString(), event.params.investor, event.params.amount);
  let history = getDivestHistory(event.block.timestamp);
  let investor = getInvestor(event.params.investor.toHex());
  
  investor.totalInvest = investor.totalInvest.plus(event.params.amount);
  history.totalDivestVolume = history.totalDivestVolume.plus(BigInt.fromI32(1));
  history.count = history.count.plus(BigInt.fromI32(1));
  
  investor.save();
  divest.save();
  history.save();
}