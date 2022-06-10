import {
  Divested,
  Invested,
  InvestorAdded,
  InvestorRemoved,
  ModifiedPrivateInvestors,
} from "../../generated/templates/TraderPool/TraderPool";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { extendArray, reduceArray } from "../helpers/ArrayHelper";
import { getInvestor } from "../entities/trader-pool/Investor";
import { getTraderPoolHistory } from "../entities/trader-pool/history/TraderPoolHistory";
import { getInvestorInfo } from "../entities/trader-pool/InvestorInfo";
import { getVestHistory } from "../entities/trader-pool/history/VestHistory";
import { getVest } from "../entities/trader-pool/Vest";
import { Vest, VestHistory } from "../../generated/schema";

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
  // newVest(event);
  let investor = getInvestor(event.params.investor);
  let pool = getTraderPool(event.address);
  let investorInfo = getInvestorInfo(investor, pool);
  let usdValue = getUSDValue(new Bytes(0), BigInt.zero());
  let vest = getVest(
    event.transaction.hash,
    investorInfo,
    true,
    event.params.amount,
    event.params.toMintLP,
    usdValue,
    event.block.timestamp
  );
  let history = getVestHistory(event.block.timestamp, pool);

  investorInfo.totalInvestVolume = investorInfo.totalInvestVolume.plus(event.params.amount);
  history.totalInvestBaseVolume = history.totalInvestBaseVolume.plus(event.params.amount);
  history.totalInvestUSDVolume = history.totalInvestUSDVolume.plus(usdValue);
  vest.day = history.id;

  investorInfo.save();
  history.save();
  vest.save();
}

export function onDivest(event: Divested): void {
  // newVest(event);
  let investor = getInvestor(event.params.investor);
  let pool = getTraderPool(event.address);
  let investorInfo = getInvestorInfo(investor, pool);
  let usdValue = getUSDValue(new Bytes(0), BigInt.zero());
  let vest = getVest(
    event.transaction.hash,
    investorInfo,
    false,
    event.params.amount,
    event.params.commission,
    usdValue,
    event.block.timestamp
  );
  let history = getVestHistory(event.block.timestamp, pool);

  investorInfo.totalDivestVolume = investorInfo.totalDivestVolume.plus(event.params.amount);
  history.totalDivestBaseVolume = history.totalDivestBaseVolume.plus(event.params.amount);
  history.totalDivestUSDVolume = history.totalDivestUSDVolume.plus(usdValue);
  vest.day = history.id;

  investorInfo.save();
  history.save();
  vest.save();
}

// function newVest(event: Invested|Divested): void {
//   let investor = getInvestor(event.params.investor);
//   let pool = getTraderPool(event.address);
//   let investorInfo = getInvestorInfo(investor, pool);
//   let vest : Vest;
//   let history : VestHistory;
//   if (event instanceof Invested){
//     vest = getVest(
//       event.transaction.hash,
//       investorInfo,
//       true,
//       event.params.amount,
//       event.params.toMintLP,
//       event.block.timestamp
//     );
//     history = getVestHistory(event.block.timestamp, pool);
//     investorInfo.totalInvestVolume = investorInfo.totalInvestVolume.plus(event.params.amount);
//     history.totalInvestVolume = history.totalInvestVolume.plus(event.params.amount);
//   }else{
//     vest = getVest(
//       event.transaction.hash,
//       investorInfo,
//       false,
//       event.params.amount,
//       event.params.commission,
//       event.block.timestamp
//     );
//     history = getVestHistory(event.block.timestamp, pool);
//     investorInfo.totalDivestVolume = investorInfo.totalDivestVolume.plus(event.params.amount);
//     history.totalDivestVolume = history.totalDivestVolume.plus(event.params.amount);
//   }

//   vest.day = history.id;

//   investorInfo.save();
//   history.save();
//   vest.save();
// }

function getUSDValue(token: Bytes, amount: BigInt): BigInt {
  return BigInt.zero();
}
