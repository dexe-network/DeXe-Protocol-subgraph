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
import { BigInt } from "@graphprotocol/graph-ts";
import { getPositionId } from "../helpers/Position";
import { getInvestHistory } from "../entities/basic-pool/history/InvestHistory";
import { getExchangeHistory } from "../entities/basic-pool/history/ExchangeHistory";
import { getDivest } from "../entities/basic-pool/Divest";
import { getDivestHistory } from "../entities/basic-pool/history/DivestHistory";
import { getInvestorInfo } from "../entities/basic-pool/InvestorInfo";
import { getBasicPoolHistory } from "../entities/basic-pool/history/BasicPoolHistory";
import { getInvestorLPHistory } from "../entities/basic-pool/history/InvestorLPHistory";
import { extendArray, reduceArray } from "../helpers/ArrayHelper";

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

  let history = getExchangeHistory(event.block.timestamp, basicPool.id);
  trade.day = history.id;

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

  basicPool.save();
  position.save();
  positionOffset.save();
}

export function onInvestorAdded(event: InvestorAdded): void {
  let pool = getBasicTraderPool(event.address);
  pool.investors = extendArray(pool.investors, [event.params.investor]);
  pool.save();
}

export function onInvest(event: Invested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let invest = getInvest(event.transaction.hash, investorInfo.id, event.params.amount, event.params.toMintLP);
  let history = getInvestHistory(event.block.timestamp, event.address);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  history.totalInvestVolume = history.totalInvestVolume.plus(event.params.amount);
  investorInfo.totalInvestVolume = investorInfo.totalInvestVolume.plus(event.params.amount);

  invest.day = history.id;

  lpHistory.lpBalance = lpHistory.lpBalance.plus(event.params.toMintLP);

  investorInfo.save();
  invest.save();
  history.save();
  lpHistory.save();
}

export function onInvestorRemoved(event: InvestorRemoved): void {
  let basicPool = getBasicTraderPool(event.address);
  basicPool.investors = reduceArray(basicPool.investors, [event.params.investor]);

  let basicPoolHistory = getBasicPoolHistory(event.block.timestamp, basicPool.id, basicPool.investors);
  basicPoolHistory.investors = reduceArray(basicPoolHistory.investors, [event.params.investor]);

  basicPool.save();
  basicPoolHistory.save();
}

export function onDivest(event: Divested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let divest = getDivest(event.transaction.hash, investorInfo.id, event.params.amount);
  let history = getDivestHistory(event.block.timestamp, event.address);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  investorInfo.totalDivestVolume = investorInfo.totalDivestVolume.plus(event.params.amount);
  history.totalDivestVolume = history.totalDivestVolume.plus(event.params.amount);
  divest.day = history.id;

  lpHistory.lpBalance = lpHistory.lpBalance.minus(event.params.amount);

  investorInfo.save();
  divest.save();
  history.save();
}

export function onTraderCommissionMinted(event: TraderCommissionMinted): void {
  let investorInfo = getInvestorInfo(event.params.trader, event.address);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  lpHistory.lpBalance = lpHistory.lpBalance.plus(event.params.amount);

  lpHistory.save();
  investorInfo.save();
}

export function onTraderCommissionPaid(event: TraderCommissionPaid): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
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
