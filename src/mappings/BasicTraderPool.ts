import { Exchanged, PositionClosed } from "../../generated/templates/BasicPool/BasicPool"
import { getBasicTraderPool } from "../entities/BasicTraderPool";
import { getPositionOffsetInBasicPool } from "../entities/PositionOffsetInBasicPool";
import { getPositionInBasicPool } from "../entities/PositionInBasicPool";
import { getTradeInBasicPool } from "../entities/TradeInBasicPool";
import { BigInt } from "@graphprotocol/graph-ts";

export function onExchange(event: Exchanged): void {
  let basicPool = getBasicTraderPool(event.params.pool);

  let positionOffsetId = event.params.pool.toString() + event.params.position.toString();
  let positionOffset = getPositionOffsetInBasicPool(positionOffsetId);

  let positionId = positionOffsetId + positionOffset.offset.toString();
  let position = getPositionInBasicPool(positionId, event.params.position, basicPool.id);

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

  positionOffset.save();
  position.save();
  trade.save();
}

export function onClose(event: PositionClosed): void {
  let positionOffsetId = event.params.pool.toString() + event.params.position.toString();
  let positionOffset = getPositionOffsetInBasicPool(positionOffsetId);

  positionOffset.offset = positionOffset.offset.plus(BigInt.fromI32(1));

  positionOffset.save();
}
