import {
  Exchanged,
  PositionClosed,
  InvestorAdded,
  Invested,
  InvestorRemoved,
  Divested,
  TraderCommissionMinted,
  TraderCommissionPaid,
  DescriptionURLChanged,
} from "../../generated/templates/BasicPool/BasicPool";
import { getBasicTraderPool } from "../entities/basic-pool/BasicTraderPool";
import { getPositionOffset } from "../entities/global/PositionOffset";
import { getPosition } from "../entities/basic-pool/Position";
import { getExchange } from "../entities/basic-pool/Exchange";
import { getInvest } from "../entities/basic-pool/Invest";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { getPositionId } from "../helpers/Position";
import { getInvestHistory } from "../entities/basic-pool/history/InvestHistory";
import { getExchangeHistory } from "../entities/basic-pool/history/ExchangeHistory";
import { getInvestor } from "../entities/basic-pool/Investor";
import { getDivest } from "../entities/basic-pool/Divest";
import { getDivestHistory } from "../entities/basic-pool/history/DivestHistory";
import { getInvestorInfo } from "../entities/basic-pool/InvestorInfo";
import { removeByIndex } from "../helpers/ArrayHelper";
import { getBasicPoolHistory } from "../entities/basic-pool/history/BasicPoolHistory";
import { getInvestorLPHistory } from "../entities/basic-pool/history/InvestorLPHistory";
import { DAY } from "../entities/global/globals";

export function onExchange(event: Exchanged): void {
  let basicPool = getBasicTraderPool(event.address);

  let position = getPosition(getPositionId(basicPool.id, event.params.toToken), basicPool.id, event.params.toToken);

  let trade = getExchange(
    event.transaction.hash,
    position.id,
    event.params.fromToken,
    event.params.toToken,
    event.params.fromVolume,
    event.params.toVolume
  );

  if (trade.toToken != basicPool.baseToken) {
    // adding funds to the position
    let fullVolume = position.totalOpenVolume.plus(trade.toVolume);
    position.totalOpenVolume = fullVolume;
  } else if (trade.fromToken != basicPool.baseToken) {
    // withdrawing funds from the position
    position.totalCloseVolume = position.totalCloseVolume.plus(trade.toVolume);
  }

  let history = getExchangeHistory(event.block.timestamp, basicPool.id);
  trade.day = history.id;

  position.liveTime = event.block.timestamp;

  let day = event.block.timestamp.div(BigInt.fromI32(DAY));
  if (day > basicPool.lastUpdate) {
    basicPool.averagePositionTime = basicPool.totalPositionTime.div(
      basicPool.creationTime.minus(event.block.timestamp).div(BigInt.fromI32(DAY))
    );
    basicPool.lastUpdate = day;
  }

  basicPool.totalTrades = basicPool.totalTrades.plus(BigInt.fromI32(1));
  basicPool.averageTrades = basicPool.averageTrades.div(
    basicPool.creationTime.minus(event.block.timestamp).div(BigInt.fromI32(DAY))
  );

  basicPool.save();
  position.save();
  trade.save();
  history.save();
}

export function onClose(event: PositionClosed): void {
  let basicPool = getBasicTraderPool(event.address);
  let positionOffset = getPositionOffset(basicPool.id, event.params.position);
  let position = getPosition(getPositionId(basicPool.id, event.params.position), basicPool.id, event.params.position);

  position.closed = true;
  positionOffset.offset = positionOffset.offset.plus(BigInt.fromI32(1));

  position.liveTime = event.block.timestamp.minus(position.liveTime);

  let day = event.block.timestamp.div(BigInt.fromI32(DAY));
  if (day > basicPool.lastUpdate) {
    basicPool.averageTrades = basicPool.averageTrades.div(
      basicPool.creationTime.minus(event.block.timestamp).div(BigInt.fromI32(DAY))
    );
    basicPool.lastUpdate = day;
  }

  basicPool.totalPositionTime = basicPool.totalPositionTime.plus(event.block.timestamp.minus(position.liveTime));
  basicPool.averagePositionTime = basicPool.totalPositionTime.div(
    basicPool.creationTime.minus(event.block.timestamp).div(BigInt.fromI32(DAY))
  );

  let loss = position.totalOpenVolume.minus(position.totalCloseVolume);
  if (loss > basicPool.maxLoss) {
    basicPool.maxLoss = loss;
  }

  basicPool.save();
  position.save();
  positionOffset.save();
}

export function onInvestorAdded(event: InvestorAdded): void {
  let investor = getInvestor(event.params.investor, event.address, event.block.timestamp);
  investor.save();

  let day = event.block.timestamp.div(BigInt.fromI32(DAY));
  let basicPool = getBasicTraderPool(event.address);
  if (day > basicPool.lastUpdate) {
    basicPool.averagePositionTime = basicPool.totalPositionTime.div(
      basicPool.creationTime.minus(event.block.timestamp).div(BigInt.fromI32(DAY))
    );
    basicPool.averageTrades = basicPool.averageTrades.div(
      basicPool.creationTime.minus(event.block.timestamp).div(BigInt.fromI32(DAY))
    );
    basicPool.lastUpdate = day;
  }
  basicPool.save();
}

export function onInvest(event: Invested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address, event.block.timestamp);
  let invest = getInvest(event.transaction.hash, investorInfo.id, event.params.amount, event.params.toMintLP);
  let history = getInvestHistory(event.block.timestamp, event.address);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  history.totalInvestVolume = history.totalInvestVolume.plus(event.params.amount);
  investorInfo.totalInvestVolume = investorInfo.totalInvestVolume.plus(event.params.amount);

  invest.day = history.id;

  lpHistory.lpBalance = lpHistory.lpBalance.plus(event.params.toMintLP);

  let day = event.block.timestamp.div(BigInt.fromI32(DAY));
  let basicPool = getBasicTraderPool(event.address);
  if (day > basicPool.lastUpdate) {
    basicPool.averagePositionTime = basicPool.totalPositionTime.div(
      basicPool.creationTime.minus(event.block.timestamp).div(BigInt.fromI32(DAY))
    );
    basicPool.averageTrades = basicPool.averageTrades.div(
      basicPool.creationTime.minus(event.block.timestamp).div(BigInt.fromI32(DAY))
    );
    basicPool.lastUpdate = day;
  }

  basicPool.save();
  investorInfo.save();
  invest.save();
  history.save();
  lpHistory.save();
}

export function onInvestorRemoved(event: InvestorRemoved): void {
  let investor = getInvestor(event.params.investor, event.address, event.block.timestamp);
  let basicPool = getBasicTraderPool(event.address);
  investor.activePools = removeByIndex(investor.activePools, investor.activePools.indexOf(basicPool.id));
  investor.save();

  let basicPoolHistory = getBasicPoolHistory(event.block.timestamp, basicPool.id, basicPool.investors);
  basicPoolHistory.investors = removeByIndex(
    basicPoolHistory.investors,
    basicPoolHistory.investors.indexOf(basicPool.id)
  );

  let day = event.block.timestamp.div(BigInt.fromI32(DAY));
  if (day > basicPool.lastUpdate) {
    basicPool.averagePositionTime = basicPool.totalPositionTime.div(
      basicPool.creationTime.minus(event.block.timestamp).div(BigInt.fromI32(DAY))
    );
    basicPool.averageTrades = basicPool.averageTrades.div(
      basicPool.creationTime.minus(event.block.timestamp).div(BigInt.fromI32(DAY))
    );
    basicPool.lastUpdate = day;
  }

  basicPoolHistory.save();

  basicPool.investors = removeByIndex(basicPool.investors, basicPool.investors.indexOf(investor.id));
  basicPool.save();
}

export function onDivest(event: Divested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address, event.block.timestamp);
  let divest = getDivest(event.transaction.hash, investorInfo.id, event.params.amount);
  let history = getDivestHistory(event.block.timestamp, event.address);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  investorInfo.totalDivestVolume = investorInfo.totalDivestVolume.plus(event.params.amount);
  history.totalDivestVolume = history.totalDivestVolume.plus(event.params.amount);
  divest.day = history.id;

  lpHistory.lpBalance = lpHistory.lpBalance.minus(event.params.amount);

  let day = event.block.timestamp.div(BigInt.fromI32(DAY));
  let basicPool = getBasicTraderPool(event.address);
  if (day > basicPool.lastUpdate) {
    basicPool.averagePositionTime = basicPool.totalPositionTime.div(
      basicPool.creationTime.minus(event.block.timestamp).div(BigInt.fromI32(DAY))
    );
    basicPool.averageTrades = basicPool.averageTrades.div(
      basicPool.creationTime.minus(event.block.timestamp).div(BigInt.fromI32(DAY))
    );
    basicPool.lastUpdate = day;
  }
  basicPool.save();

  investorInfo.save();
  divest.save();
  history.save();
}

export function onTraderCommissionMinted(event: TraderCommissionMinted): void {
  let investorInfo = getInvestorInfo(event.params.trader, event.address, event.block.timestamp);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  lpHistory.lpBalance = lpHistory.lpBalance.plus(event.params.amount);

  lpHistory.save();
  investorInfo.save();
}

export function onTraderCommissionPaid(event: TraderCommissionPaid): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address, event.block.timestamp);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  lpHistory.lpBalance = lpHistory.lpBalance.minus(event.params.amount);

  lpHistory.save();
  investorInfo.save();
}

export function onDescriptionURLChanged(event: DescriptionURLChanged): void {
  let pool = getBasicTraderPool(event.address);
  pool.descriptionURL = event.params.descriptionURL;
  pool.save();
}
