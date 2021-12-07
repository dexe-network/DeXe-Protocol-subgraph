import { Exchanged, PositionClosed, InvestorAdded, Invest, InvestorRemoved } from "../../generated/templates/BasicPool/BasicPool"
import { getBasicTraderPool } from "../entities/BasicTraderPool";
import { getPositionOffset } from "../entities/PositionOffset";
import { getPositionInBasicPool } from "../entities/PositionInBasicPool";
import { getTradeInBasicPool } from "../entities/TradeInBasicPool";
import { getInvestment } from "../entities/Investment";
import { BigInt } from "@graphprotocol/graph-ts";
import { getPositionId } from "../helpers/Position";
import { getInvestHistory } from "../entities/InvestHistory";
import { getExchangeBasicPoolHistory } from "../entities/ExchangeBasicPoolHistory";

export function onExchange(event: Exchanged): void {
  let basicPool = getBasicTraderPool(event.params.pool);

  let position = getPositionInBasicPool(getPositionId(event.params.pool, event.params.position), event.params.position, basicPool.id);

  let trade = getTradeInBasicPool(
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

  let history = getExchangeBasicPoolHistory(event.block.timestamp);
  history.exchangesCount = history.exchangesCount.plus(BigInt.fromI32(1));
  history.exchanges.push(trade.id);

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
}

export function onInvest(event: Invest): void {
  let invest = getInvestment(event.transaction.hash.toHexString(), event.params.investor, event.params.amount, event.params.lpPurchasePrice);
  let history = getInvestHistory(event.block.timestamp);

  history.totalInvestVolume = history.totalInvestVolume.plus(BigInt.fromI32(1));
  history.count = history.count.plus(BigInt.fromI32(1));
  history.investments.push(invest.id);
  invest.save();
  history.save();
}

export function onInvestorRemoved(event: InvestorRemoved): void {
  let history = getInvestHistory(event.block.timestamp);
  history.removedInvestors = history.removedInvestors.plus(BigInt.fromI32(1));
  history.save();
}