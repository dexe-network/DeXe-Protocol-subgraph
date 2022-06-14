import {
  Divested,
  Invested,
  InvestorAdded,
  InvestorRemoved,
  ModifiedPrivateInvestors,
} from "../../generated/templates/TraderPool/TraderPool";
import { PriceFeed } from "../../generated/templates/TraderPool/PriceFeed";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { extendArray, reduceArray } from "../helpers/ArrayHelper";
import { getInvestor } from "../entities/trader-pool/Investor";
import { getTraderPoolHistory } from "../entities/trader-pool/history/TraderPoolHistory";
import { getInvestorPosition } from "../entities/trader-pool/InvestorPosition";
import { getVest } from "../entities/trader-pool/Vest";
import { getPositionOffset } from "../entities/global/PositionOffset";
import { PRICE_FEED_ADDRESS } from "../entities/global/globals";

export function onInvestorAdded(event: InvestorAdded): void {
  let pool = getTraderPool(event.address);
  let history = getTraderPoolHistory(pool, event.block.timestamp);

  let investor = getInvestor(event.params.investor);
  pool.investors = extendArray(pool.investors, [investor.id]);
  pool.investorsCount = pool.investorsCount.plus(BigInt.fromI32(1));

  history.investors = extendArray(history.investors, [investor.id]);
  history.investorsCount = history.investorsCount.plus(BigInt.fromI32(1));

  investor.activePools = extendArray(investor.activePools, [pool.id]);
  investor.allPools = extendArray(investor.allPools, [pool.id]);

  let positionOffset = getPositionOffset(pool, investor);
  let investorPosition = getInvestorPosition(investor, pool, positionOffset);

  /* TODO set volumes */

  positionOffset.save();
  investorPosition.save();
  investor.save();
  pool.save();
  history.save();
}

export function onInvestorRemoved(event: InvestorRemoved): void {
  let pool = getTraderPool(event.address);
  let history = getTraderPoolHistory(pool, event.block.timestamp);

  let investor = getInvestor(event.params.investor);
  pool.investors = reduceArray(pool.investors, [investor.id]);
  pool.investorsCount = pool.investorsCount.minus(BigInt.fromI32(1));

  history.investors = reduceArray(history.investors, [investor.id]);
  history.investorsCount = history.investorsCount.minus(BigInt.fromI32(1));

  investor.activePools = reduceArray(investor.activePools, [pool.id]);

  let positionOffset = getPositionOffset(pool, investor);
  let investorPosition = getInvestorPosition(investor, pool, positionOffset);

  positionOffset.offset = positionOffset.offset.plus(BigInt.fromI32(1));
  investorPosition.isClosed = true;

  positionOffset.save();
  investorPosition.save();

  investor.save();
  pool.save();
  history.save();
}

export function onModifiedPrivateInvestors(event: ModifiedPrivateInvestors): void {
  let pool = getTraderPool(event.address);
  let history = getTraderPoolHistory(pool, event.block.timestamp);

  let newArray = new Array<string>();

  for (let i = 0; i < event.params.privateInvestors.length; i++) {
    newArray.push(event.params.privateInvestors[i].toHexString());
  }

  if (event.params.add) {
    pool.privateInvestors = extendArray(pool.privateInvestors, newArray);
    pool.privateInvestorsCount = pool.privateInvestorsCount.plus(BigInt.fromI32(newArray.length));

    history.privateInvestors = extendArray(history.privateInvestors, newArray);
    history.privateInvestorsCount = history.privateInvestorsCount.plus(BigInt.fromI32(newArray.length));
  } else {
    pool.privateInvestors = reduceArray(pool.privateInvestors, newArray);
    pool.privateInvestorsCount = pool.privateInvestorsCount.minus(BigInt.fromI32(newArray.length));

    history.privateInvestors = reduceArray(history.privateInvestors, newArray);
    history.privateInvestorsCount = history.privateInvestorsCount.minus(BigInt.fromI32(newArray.length));
  }
  pool.save();
  history.save();
}

export function onInvest(event: Invested): void {
  let investor = getInvestor(event.params.investor);
  let pool = getTraderPool(event.address);
  let positionOffset = getPositionOffset(pool, investor);
  let investorPosition = getInvestorPosition(investor, pool, positionOffset);
  let usdValue = getUSDValue(pool.token, event.params.investedBase);
  let vest = getVest(
    event.transaction.hash,
    investorPosition,
    true,
    event.params.investedBase,
    event.params.receivedLP,
    usdValue,
    event.block.timestamp
  );

  investorPosition.totalBaseInvestVolume = investorPosition.totalBaseInvestVolume.plus(event.params.investedBase);
  investorPosition.totalLPInvestVolume = investorPosition.totalLPInvestVolume.plus(event.params.receivedLP);
  investorPosition.totalUSDInvestVolume = investorPosition.totalUSDInvestVolume.plus(usdValue);

  investorPosition.save();
  vest.save();
}

export function onDivest(event: Divested): void {
  let investor = getInvestor(event.params.investor);
  let pool = getTraderPool(event.address);
  let positionOffset = getPositionOffset(pool, investor);
  let investorPosition = getInvestorPosition(investor, pool, positionOffset);
  let usdValue = getUSDValue(pool.token, event.params.receivedBase);
  let vest = getVest(
    event.transaction.hash,
    investorPosition,
    false,
    event.params.receivedBase,
    event.params.divestedLP,
    usdValue,
    event.block.timestamp
  );

  investorPosition.totalBaseDivestVolume = investorPosition.totalBaseDivestVolume.plus(event.params.receivedBase);
  investorPosition.totalLPDivestVolume = investorPosition.totalLPDivestVolume.plus(event.params.divestedLP);
  investorPosition.totalUSDDivestVolume = investorPosition.totalUSDDivestVolume.plus(usdValue);

  investorPosition.save();
  vest.save();
}

function getUSDValue(token: Bytes, amount: BigInt): BigInt {
  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));
  let value = pfPrototype.try_getNormalizedPriceOutUSD(Address.fromString(token.toString()), amount);

  if (!value.reverted) {
    return value.value.value0;
  }

  return BigInt.zero();
}
