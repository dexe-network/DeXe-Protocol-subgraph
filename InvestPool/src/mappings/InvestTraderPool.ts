import {
  Exchanged,
  PositionClosed,
  InvestorAdded,
  Invest,
  InvestorRemoved,
  Divest,
  MintLP,
  BurnLP,
} from "../../generated/templates/InvestPool/InvestPool";
import { getInvestTraderPool } from "../entities/invest-pool/InvestTraderPool";
import { getPositionOffset } from "../entities/global/PositionOffset";
import { getPositionInInvestPool } from "../entities/invest-pool/PositionInInvestPool";
import { getExchangeInInvestPool } from "../entities/invest-pool/ExchangeInInvestPool";
import { getInvestInInvestPool } from "../entities/invest-pool/InvestInInvestPool";
import { BigInt } from "@graphprotocol/graph-ts";
import { getPositionId } from "../helpers/Position";
import { getInvestHistoryInInvestPool } from "../entities/invest-pool/history/InvestHistoryInInvestPool";
import { getExchangeHistoryInInvestPool } from "../entities/invest-pool/history/ExchangeHistoryInInvestPool";
import { getInvestorInInvestPool } from "../entities/invest-pool/InvestorInInvestPool";
import { getDivestInInvestPool } from "../entities/invest-pool/DivestInInvestPool";
import { getDivestHistoryInInvestPool } from "../entities/invest-pool/history/DivestHistoryInInvestPool";
import { getInvestorInfo } from "../entities/invest-pool/InvestorInfo";
import { removeByIndex } from "../helpers/ArrayHelper";
import { getInvestPoolHistory } from "../entities/invest-pool/InvestPoolHistory";
import { getInvestorLPHistory } from "../entities/invest-pool/history/InvestorLPHistory";

export function onExchange(event: Exchanged): void {
  let investPool = getInvestTraderPool(event.address);

  let position = getPositionInInvestPool(
    getPositionId(getInvestTraderPool(event.address).id, event.params.toToken),
    event.address,
    event.params.toToken
  );

  let trade = getExchangeInInvestPool(
    event.transaction.hash,
    position.id,
    event.params.fromToken,
    event.params.toToken,
    event.params.fromVolume,
    event.params.toVolume
  );

  if (trade.toToken != investPool.baseToken) {
    // adding funds to the position
    let fullVolume = position.totalOpenVolume.plus(trade.toVolume);
    position.totalOpenVolume = fullVolume;
  } else if (trade.fromToken != investPool.baseToken) {
    // withdrawing funds from the position
    position.totalCloseVolume = position.totalCloseVolume.plus(trade.toVolume);
  }

  let history = getExchangeHistoryInInvestPool(event.block.timestamp, event.address);
  trade.day = history.id;

  investPool.save();
  position.save();
  trade.save();
  history.save();
}

export function onClose(event: PositionClosed): void {
  let positionOffset = getPositionOffset(getInvestTraderPool(event.address).id, event.params.position);
  let position = getPositionInInvestPool(
    getPositionId(getInvestTraderPool(event.address).id, event.params.position),
    event.address,
    event.params.position
  );

  position.closed = true;
  positionOffset.offset = positionOffset.offset.plus(BigInt.fromI32(1));

  position.save();
  positionOffset.save();
}

export function onInvestorAdded(event: InvestorAdded): void {
  let investor = getInvestorInInvestPool(event.params.investor, event.address);
  let investPool = getInvestTraderPool(event.address);
  investor.activePools.push(investPool.id);
  investor.allPools.push(investPool.id);
  investor.save();

  let investPoolHistory = getInvestPoolHistory(event.block.timestamp, event.address, investPool.investors);
  investPoolHistory.investors.push(investor.id);
  investPoolHistory.save();

  investPool.investors.push(investor.id);
  investPool.save();
}

export function onInvest(event: Invest): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let invest = getInvestInInvestPool(
    event.transaction.hash,
    investorInfo.id,
    event.params.amount,
    event.params.toMintLP
  );
  let history = getInvestHistoryInInvestPool(event.block.timestamp, event.address);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  history.totalInvestVolume = history.totalInvestVolume.plus(event.params.amount);
  investorInfo.totalInvestVolume = investorInfo.totalInvestVolume.plus(event.params.amount);

  invest.day = history.id;

  lpHistory.lpBalance.plus(event.params.toMintLP);

  investorInfo.save();
  invest.save();
  history.save();
  lpHistory.save();
}

export function onInvestorRemoved(event: InvestorRemoved): void {
  let investor = getInvestorInInvestPool(event.params.investor, event.address);
  let investPool = getInvestTraderPool(event.address);
  investor.activePools = removeByIndex(investor.activePools, investor.activePools.indexOf(investPool.id));
  investor.save();

  let investPoolHistory = getInvestPoolHistory(event.block.timestamp, event.address, investPool.investors);
  investPoolHistory.investors = removeByIndex(
    investPoolHistory.investors,
    investPoolHistory.investors.indexOf(investPool.id)
  );
  investPoolHistory.save();

  investPool.investors = removeByIndex(investPool.investors, investPool.investors.indexOf(investor.id));
  investPool.save();
}

export function onDivest(event: Divest): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let divest = getDivestInInvestPool(event.transaction.hash, investorInfo.id, event.params.amount);
  let history = getDivestHistoryInInvestPool(event.block.timestamp, event.address);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  investorInfo.totalDivestVolume = investorInfo.totalDivestVolume.plus(event.params.amount);
  history.totalDivestVolume = history.totalDivestVolume.plus(event.params.amount);
  divest.day = history.id;

  lpHistory.lpBalance.minus(event.params.amount);

  investorInfo.save();
  divest.save();
  history.save();
}

export function onMintLP(event: MintLP): void {
  let investorInfo = getInvestorInfo(event.params.trader, event.address);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  lpHistory.lpBalance.plus(event.params.amount);

  lpHistory.save();
  investorInfo.save();
}

export function onBurnLP(event: BurnLP): void {
  let investorInfo = getInvestorInfo(event.params.trader, event.address);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  lpHistory.lpBalance.minus(event.params.amount);

  lpHistory.save();
  investorInfo.save();
}
