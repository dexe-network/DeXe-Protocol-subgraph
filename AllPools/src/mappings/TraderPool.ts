import {
  Exchanged,
  PositionClosed,
  InvestorAdded,
  InvestorRemoved,
  DescriptionURLChanged,
  ModifiedAdmins,
} from "../../generated/templates/TraderPool/TraderPool";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { getPositionOffset } from "../entities/global/PositionOffset";
import { getPosition } from "../entities/trader-pool/Position";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { getPositionId } from "../helpers/Position";
import { DAY, PRICE_FEED_ADDRESS } from "../entities/global/globals";
import { PriceFeed } from "../../generated/templates/TraderPool/PriceFeed";
import { Exchange, Position, TraderPool } from "../../generated/schema";
import { upcastCopy, extendArray, reduceArray } from "../helpers/ArrayHelper";
import { getInvestor } from "../entities/trader-pool/Investor";
import { getExchange } from "../entities/trader-pool/Exchange";
import { getExchangeHistory } from "../entities/trader-pool/history/ExchangeHistory";

export function onExchange(event: Exchanged): void {
  let pool = getTraderPool(event.address);

  let position1: Position;
  let position2: Position;

  let fromBaseVolume = event.params.fromVolume;
  let toBaseVolume = event.params.toVolume;

  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));

  if (event.params.toToken != pool.baseToken) {
    // adding funds to the position

    position1 = getPosition(getPositionId(pool.id, event.params.toToken), pool.id, event.params.toToken);
    position1.totalPositionOpenVolume = position1.totalPositionOpenVolume.plus(event.params.toVolume);

    if (event.params.fromToken != pool.baseToken) {
      fromBaseVolume = getFromPriceFeed(
        pfPrototype,
        event.params.fromToken,
        Address.fromString(pool.baseToken.toHexString()),
        event.params.fromVolume
      );
    }

    position1.totalBaseOpenVolume = position1.totalBaseOpenVolume.plus(fromBaseVolume);
  }

  if (event.params.fromToken != pool.baseToken) {
    // withdrawing funds from the position

    position2 = getPosition(getPositionId(pool.id, event.params.fromToken), pool.id, event.params.fromToken);
    position2.totalPositionCloseVolume = position2.totalPositionCloseVolume.plus(event.params.fromVolume);

    if (event.params.toToken != pool.baseToken) {
      toBaseVolume = getFromPriceFeed(
        pfPrototype,
        event.params.toToken,
        Address.fromString(pool.baseToken.toHexString()),
        event.params.toVolume
      );
    }

    position2.totalBaseCloseVolume = position2.totalBaseCloseVolume.plus(toBaseVolume);
  }

  if (position1 == null && position2 == null) {
    return; // catch any random error
  }

  if (position2 == null) {
    // pos1
    exchangeSetup(pool, position1, event, fromBaseVolume, true, "_0");
  } else if (position1 == null) {
    // pos2
    exchangeSetup(pool, position2, event, toBaseVolume, false, "_0");
  } else {
    // pos1 && pos2
    exchangeSetup(pool, position1, event, fromBaseVolume, true, "_1");
    exchangeSetup(pool, position2, event, toBaseVolume, false, "_2");
  }

  let days = event.block.timestamp.minus(pool.creationTime).div(BigInt.fromI32(DAY));
  pool.averageTrades = pool.totalTrades.div(days.equals(BigInt.zero()) ? BigInt.fromI32(1) : days);

  pool.save();
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

  let loss = position.totalBaseOpenVolume.minus(position.totalBaseOpenVolume);
  if (loss > basicPool.maxLoss) {
    basicPool.maxLoss = loss;
  }

  basicPool.save();
  position.save();
  positionOffset.save();
}

export function onInvestorAdded(event: InvestorAdded): void {
  let pool = getTraderPool(event.address);

  let investor = getInvestor(event.params.investor);
  pool.investors = extendArray(pool.investors, [investor.id]);
  pool.investorsCount = pool.investorsCount.plus(BigInt.fromI32(1));

  investor.activePools = extendArray(investor.activePools, [pool.id]);
  investor.allPools = extendArray(investor.allPools, [pool.id]);

  investor.save();
  pool.save();
}

export function onInvestorRemoved(event: InvestorRemoved): void {
  let pool = getTraderPool(event.address);

  let investor = getInvestor(event.params.investor);
  pool.investors = reduceArray(pool.investors, [investor.id]);
  pool.investorsCount = pool.investorsCount.minus(BigInt.fromI32(1));

  investor.activePools = reduceArray(investor.activePools, [pool.id]);

  investor.save();
  pool.save();
}

export function onDescriptionURLChanged(event: DescriptionURLChanged): void {
  let pool = getTraderPool(event.address);
  pool.descriptionURL = event.params.descriptionURL;
  pool.save();
}

export function onModifiedAdmins(event: ModifiedAdmins): void {
  let pool = getTraderPool(event.address);

  let admins = upcastCopy<Address, Bytes>(event.params.admins);

  if (event.params.add) {
    pool.admins = extendArray<Bytes>(pool.admins, admins);
  } else {
    pool.admins = reduceArray<Bytes>(pool.admins, admins);
  }

  pool.admins = extendArray(pool.admins, [pool.trader]);
}

function exchangeSetup(
  pool: TraderPool,
  position: Position,
  event: Exchanged,
  volume: BigInt,
  flag: boolean,
  suffix: string
): void {
  if (position.startTimestamp.equals(BigInt.zero())) {
    position.startTimestamp = event.block.timestamp;
  }

  let trade: Exchange;
  if (flag) {
    trade = getExchange(
      event.transaction.hash,
      position.id,
      event.params.fromToken,
      event.params.toToken,
      volume,
      event.params.toVolume,
      flag, // true
      suffix,
      event.block.timestamp
    );
  } else {
    trade = getExchange(
      event.transaction.hash,
      position.id,
      event.params.fromToken,
      event.params.toToken,
      event.params.fromVolume,
      volume,
      flag, // false
      suffix,
      event.block.timestamp
    );
  }

  let history = getExchangeHistory(event.block.timestamp, pool.id);
  trade.day = history.id;
  history.save();
  trade.save();

  pool.totalTrades = pool.totalTrades.plus(BigInt.fromI32(1));

  position.save();
}

function getFromPriceFeed(pfPrototype: PriceFeed, fromToken: Address, toToken: Address, amount: BigInt): BigInt {
  let baseVolume = pfPrototype.try_getNormalizedPriceOut(fromToken, toToken, amount);

  if (baseVolume.reverted) return BigInt.zero();

  return baseVolume.value.value0;
}
