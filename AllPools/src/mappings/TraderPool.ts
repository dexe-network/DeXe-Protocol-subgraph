import {
  Exchanged,
  PositionClosed,
  Joined,
  Left,
  DescriptionURLChanged,
  ModifiedAdmins,
  ModifiedPrivateInvestors,
  ActivePortfolioExchanged,
  CommissionClaimed,
} from "../../generated/templates/TraderPool/TraderPool";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { getPositionOffset } from "../entities/global/PositionOffset";
import { getPosition } from "../entities/trader-pool/Position";
import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { pushUnique, remove, upcastCopy, findPrevHistory } from "@solarity/graph-lib";
import { getPositionId } from "../helpers/Position";
import {
  DAY,
  DECIMAL,
  REVERSED_PLATFORM_COMMISSION,
  PERCENTAGE_100,
  PRICE_FEED_ADDRESS,
  PERCENTAGE_DENOMINATOR,
  PERCENTAGE_NUMERATOR,
  MAX_SEARCH_DEPTH,
} from "../entities/global/globals";
import { PriceFeed } from "../../generated/templates/TraderPool/PriceFeed";
import { Exchange, FeeHistory, Position, TraderPool, TraderPoolPriceHistory } from "../../generated/schema";
import { getInvestor } from "../entities/trader-pool/Investor";
import { getExchange } from "../entities/trader-pool/Exchange";
import { getExchangeHistory } from "../entities/trader-pool/history/ExchangeHistory";
import { getFeeHistory } from "../entities/trader-pool/history/FeeHistory";
import { roundCheckUp } from "../entities/trader-pool/TraderPoolPriceHistory";
import { getTokenValue, getUSDValue } from "../helpers/PriceFeedInteractions";

export function onExchange(event: Exchanged): void {
  let pool = getTraderPool(event.address);

  let position1: Position;
  let position2: Position;

  let fromBaseVolume = event.params.fromVolume;
  let toBaseVolume = event.params.toVolume;

  let usdVolume = BigInt.zero();

  let baseTokenAddress = Address.fromBytes(pool.baseToken);

  if (event.params.toToken != pool.baseToken) {
    // adding funds to the position

    position1 = getPosition(getPositionId(pool.id, event.params.toToken), pool.id, event.params.toToken);
    position1.totalPositionOpenVolume = position1.totalPositionOpenVolume.plus(event.params.toVolume);

    if (event.params.fromToken != pool.baseToken) {
      fromBaseVolume = getTokenValue(event.params.fromToken, baseTokenAddress, event.params.fromVolume);
    }

    usdVolume = getUSDValue(baseTokenAddress, fromBaseVolume);

    position1.totalBaseOpenVolume = position1.totalBaseOpenVolume.plus(fromBaseVolume);
  }

  if (event.params.fromToken != pool.baseToken) {
    // withdrawing funds from the position

    position2 = getPosition(getPositionId(pool.id, event.params.fromToken), pool.id, event.params.fromToken);
    position2.totalPositionCloseVolume = position2.totalPositionCloseVolume.plus(event.params.fromVolume);

    if (event.params.toToken != pool.baseToken) {
      toBaseVolume = getTokenValue(event.params.toToken, baseTokenAddress, event.params.toVolume);
    }

    usdVolume = getUSDValue(baseTokenAddress, toBaseVolume);

    position2.totalBaseCloseVolume = position2.totalBaseCloseVolume.plus(toBaseVolume);
  }

  if (position1 == null && position2 == null) {
    return; // catch any random error
  }

  if (position2 == null) {
    // pos1
    exchangeSetup(pool, position1, event, fromBaseVolume, usdVolume, true, "_0");
  } else if (position1 == null) {
    // pos2
    exchangeSetup(pool, position2, event, toBaseVolume, usdVolume, false, "_0");
  } else {
    // pos1 && pos2
    exchangeSetup(pool, position1, event, fromBaseVolume, usdVolume, true, "_1");
    exchangeSetup(pool, position2, event, toBaseVolume, usdVolume, false, "_2");
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

export function onJoined(event: Joined): void {
  let pool = getTraderPool(event.address);

  let investor = getInvestor(event.params.user);
  pool.investors = pushUnique(pool.investors, [investor.id]);
  pool.investorsCount = pool.investorsCount.plus(BigInt.fromI32(1));

  investor.activePools = pushUnique(investor.activePools, [pool.id]);
  investor.allPools = pushUnique(investor.allPools, [pool.id]);

  investor.save();
  pool.save();
}

export function onLeft(event: Left): void {
  let pool = getTraderPool(event.address);

  let investor = getInvestor(event.params.user);
  pool.investors = remove(pool.investors, [investor.id]);
  pool.investorsCount = pool.investorsCount.minus(BigInt.fromI32(1));

  investor.activePools = remove(investor.activePools, [pool.id]);

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
    pool.admins = pushUnique<Bytes>(pool.admins, admins);
  } else {
    pool.admins = remove<Bytes>(pool.admins, admins);
  }

  pool.admins = pushUnique(pool.admins, [pool.trader]);
  pool.save();
}

export function onModifiedPrivateInvestors(event: ModifiedPrivateInvestors): void {
  let pool = getTraderPool(event.address);
  let upcastedArray = upcastCopy<Address, Bytes>(event.params.privateInvestors);
  if (event.params.add) {
    pool.privateInvestors = pushUnique(pool.privateInvestors, upcastedArray);
  } else {
    pool.privateInvestors = remove(pool.privateInvestors, upcastedArray);
  }
  pool.save();
}

export function onTraderCommissionMinted(event: CommissionClaimed): void {
  let pool = getTraderPool(event.address);
  let history = getFeeHistory(pool, event.block.timestamp);
  let priceHistory = findPrevHistory<TraderPoolPriceHistory>(
    TraderPoolPriceHistory.load,
    pool.id,
    roundCheckUp(event.block.number),
    BigInt.fromI32(MAX_SEARCH_DEPTH),
    100
  );
  let currentPNL = priceHistory == null ? BigInt.zero() : priceHistory.percPNLUSD;
  let currentLpCost = priceHistory == null ? BigInt.fromI32(1) : priceHistory.usdTVL.div(priceHistory.supply);
  let prevHistory: FeeHistory | null;

  if (history.prevHistory == "") {
    prevHistory = findPrevHistory<FeeHistory>(
      FeeHistory.load,
      event.address.toHexString(),
      history.day,
      BigInt.fromI32(MAX_SEARCH_DEPTH),
      1
    );
    history.prevHistory = prevHistory == null ? "" : prevHistory.id;
    history.PNL = currentPNL;
  } else {
    prevHistory = FeeHistory.load(history.prevHistory);
    history.PNL = currentPNL.minus(prevHistory == null ? BigInt.zero() : prevHistory.PNL);
  }

  let lpCommission = event.params.traderLpClaimed
    .times(BigInt.fromU64(DECIMAL))
    .div(BigInt.fromI32(REVERSED_PLATFORM_COMMISSION).times(BigInt.fromU64(DECIMAL).div(BigInt.fromI32(10))));
  history.perfomanceFee = lpCommission.times(currentLpCost);
  history.fundProfit = history.perfomanceFee
    .times(BigInt.fromU64(PERCENTAGE_100).minus(pool.commission))
    .div(pool.commission);

  history.save();
}
export function onActivePortfolioExchanged(event: ActivePortfolioExchanged): void {
  let pool = getTraderPool(event.address);

  let position1: Position;
  let position2: Position;

  let fromBaseVolume = event.params.fromVolume;
  let toBaseVolume = event.params.toVolume;

  let usdVolume = BigInt.zero();

  let baseTokenAddress = Address.fromBytes(pool.baseToken);

  if (event.params.toToken != pool.baseToken) {
    // adding funds to the position

    position1 = getPosition(getPositionId(pool.id, event.params.toToken), pool.id, event.params.toToken);
    position1.totalPositionOpenVolume = position1.totalPositionOpenVolume.plus(event.params.toVolume);

    if (event.params.fromToken != pool.baseToken) {
      fromBaseVolume = getTokenValue(event.params.fromToken, baseTokenAddress, event.params.fromVolume);
    }

    usdVolume = getUSDValue(baseTokenAddress, fromBaseVolume);

    position1.totalBaseOpenVolume = position1.totalBaseOpenVolume.plus(fromBaseVolume);
  }

  if (event.params.fromToken != pool.baseToken) {
    // withdrawing funds from the position

    position2 = getPosition(getPositionId(pool.id, event.params.fromToken), pool.id, event.params.fromToken);
    position2.totalPositionCloseVolume = position2.totalPositionCloseVolume.plus(event.params.fromVolume);

    if (event.params.toToken != pool.baseToken) {
      toBaseVolume = getTokenValue(event.params.toToken, baseTokenAddress, event.params.toVolume);
    }

    usdVolume = getUSDValue(baseTokenAddress, toBaseVolume);

    position2.totalBaseCloseVolume = position2.totalBaseCloseVolume.plus(toBaseVolume);
  }

  if (position1 == null && position2 == null) {
    return; // catch any random error
  }

  if (position2 == null) {
    // pos1
    position1.totalUSDOpenVolume = position1.totalUSDOpenVolume.plus(usdVolume);

    position1.save();
  } else if (position1 == null) {
    // pos2
    position2.totalUSDCloseVolume = position2.totalUSDCloseVolume.plus(usdVolume);

    position2.save();
  } else {
    // pos1 && pos2
    position1.totalUSDOpenVolume = position1.totalUSDOpenVolume.plus(usdVolume);
    position2.totalUSDCloseVolume = position2.totalUSDCloseVolume.plus(usdVolume);

    position1.save();
    position2.save();
  }
}

function exchangeSetup(
  pool: TraderPool,
  position: Position,
  event: Exchanged,
  volume: BigInt,
  usdVolume: BigInt,
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
      Address.fromBytes(pool.baseToken),
      event.params.toToken,
      volume,
      event.params.toVolume,
      usdVolume,
      flag, // true
      suffix,
      event.block.timestamp
    );
    position.totalUSDOpenVolume = usdVolume;
  } else {
    trade = getExchange(
      event.transaction.hash,
      position.id,
      event.params.fromToken,
      Address.fromString(pool.baseToken.toHexString()),
      event.params.fromVolume,
      volume,
      usdVolume,
      flag, // false
      suffix,
      event.block.timestamp
    );
    position.totalUSDCloseVolume = usdVolume;
  }

  if (suffix == "_0" || suffix == "_1") {
    recalculateOrderSize(volume, pool, event.block.number);
  }

  let history = getExchangeHistory(event.block.timestamp, pool.id);
  trade.day = history.id;
  history.save();
  trade.save();

  pool.totalTrades = pool.totalTrades.plus(BigInt.fromI32(1));

  position.save();
}

function recalculateOrderSize(baseVolume: BigInt, pool: TraderPool, block: BigInt): void {
  let lastHistory = findPrevHistory<TraderPoolPriceHistory>(
    TraderPoolPriceHistory.load,
    pool.id,
    block,
    BigInt.fromI32(MAX_SEARCH_DEPTH),
    100
  );
  let currentPercentage: BigInt;
  if (lastHistory == null || lastHistory.baseTVL.equals(BigInt.zero())) {
    currentPercentage = BigInt.zero();
  } else {
    currentPercentage = baseVolume.times(BigInt.fromU64(PERCENTAGE_NUMERATOR)).div(lastHistory.baseTVL);
  }

  pool.orderSize = pool.totalTrades
    .times(pool.orderSize)
    .plus(currentPercentage)
    .div(pool.totalTrades.plus(BigInt.fromI32(1)));
}
