import {
  Exchanged,
  PositionClosed,
  InvestorAdded,
  InvestorRemoved,
  DescriptionURLChanged,
} from "../../generated/templates/TraderPool/TraderPool";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { getPositionOffset } from "../entities/global/PositionOffset";
import { getPosition } from "../entities/trader-pool/Position";
import { BigInt } from "@graphprotocol/graph-ts";
import { getPositionId } from "../helpers/Position";
import { DAY } from "../entities/global/globals";

export function onExchange(event: Exchanged): void {
  let basicPool = getTraderPool(event.address);

  let position = getPosition(getPositionId(basicPool.id, event.params.toToken), basicPool.id, event.params.toToken);

  if (event.params.toToken != basicPool.baseToken) {
    // adding funds to the position
    position.totalOpenVolume = position.totalOpenVolume.plus(event.params.toVolume);
  } else if (event.params.fromToken != basicPool.baseToken) {
    // withdrawing funds from the position
    position.totalCloseVolume = position.totalCloseVolume.plus(event.params.toVolume);
  }

  if (position.startTimestamp.equals(BigInt.zero())) {
    position.startTimestamp = event.block.timestamp;
  }

  basicPool.totalTrades = basicPool.totalTrades.plus(BigInt.fromI32(1));
  let days = event.block.timestamp.minus(basicPool.creationTime).div(BigInt.fromI32(DAY));
  basicPool.averageTrades = basicPool.totalTrades.div(days.equals(BigInt.zero()) ? BigInt.fromI32(1) : days);

  basicPool.save();
  position.save();
}

export function onClose(event: PositionClosed): void {
  let basicPool = getTraderPool(event.address);
  let positionOffset = getPositionOffset(basicPool.id, event.params.position);
  let position = getPosition(getPositionId(basicPool.id, event.params.position), basicPool.id, event.params.position);

  position.closed = true;
  positionOffset.offset = positionOffset.offset.plus(BigInt.fromI32(1));

  position.liveTime = event.block.timestamp.minus(position.startTimestamp);

  basicPool.averagePositionTime = basicPool.averagePositionTime
    .times(basicPool.totalClosedPositions)
    .plus(position.liveTime)
    .div(basicPool.totalClosedPositions.plus(BigInt.fromI32(1)));
  basicPool.totalClosedPositions = basicPool.totalClosedPositions.plus(BigInt.fromI32(1));

  let loss = position.totalOpenVolume.minus(position.totalCloseVolume);
  if (loss > basicPool.maxLoss) {
    basicPool.maxLoss = loss;
  }

  basicPool.save();
  position.save();
  positionOffset.save();
}

export function onInvestorAdded(event: InvestorAdded): void {
  let pool = getTraderPool(event.address);
  pool.investorsCount = pool.investorsCount.plus(BigInt.fromI32(1));
  pool.save();
}

export function onInvestorRemoved(event: InvestorRemoved): void {
  let pool = getTraderPool(event.address);
  pool.investorsCount = pool.investorsCount.minus(BigInt.fromI32(1));
  pool.save();
}

export function onDescriptionURLChanged(event: DescriptionURLChanged): void {
  let pool = getTraderPool(event.address);
  pool.descriptionURL = event.params.descriptionURL;
  pool.save();
}
