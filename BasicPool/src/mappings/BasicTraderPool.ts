import {
  Exchanged,
  PositionClosed,
  InvestorAdded,
  Invested,
  InvestorRemoved,
  Divested,
  TraderCommissionMinted,
  TraderCommissionPaid,
} from "../../generated/templates/BasicPool/BasicPool";
import { getBasicTraderPool } from "../entities/basic-pool/BasicTraderPool";
import { getPositionOffset } from "../entities/global/PositionOffset";
import { getPositionInBasicPool } from "../entities/basic-pool/PositionInBasicPool";
import { getExchangeInBasicPool } from "../entities/basic-pool/ExchangeInBasicPool";
import { getInvestInBasicPool } from "../entities/basic-pool/InvestInBasicPool";
import { BigInt } from "@graphprotocol/graph-ts";
import { getPositionId } from "../helpers/Position";
import { getInvestHistoryInBasicPool } from "../entities/basic-pool/history/InvestHistoryInBasicPool";
import { getExchangeHistoryInBasicPool } from "../entities/basic-pool/history/ExchangeHistoryInBasicPool";
import { getInvestorInBasicPool } from "../entities/basic-pool/InvestorInBasicPool";
import { getDivestInBasicPool } from "../entities/basic-pool/DivestInBasicPool";
import { getDivestHistoryInBasicPool } from "../entities/basic-pool/history/DivestHistoryInBasicPool";
import { getInvestorInfo } from "../entities/basic-pool/InvestorInfo";
import { removeByIndex } from "../helpers/ArrayHelper";
import { getBasicPoolHistory } from "../entities/basic-pool/history/BasicPoolHistory";
import { getInvestorLPHistory } from "../entities/basic-pool/history/InvestorLPHistory";

export function onExchange(event: Exchanged): void {
  let basicPool = getBasicTraderPool(event.address);

  let position = getPositionInBasicPool(
    getPositionId(basicPool.id, event.params.toToken),
    basicPool.id,
    event.params.toToken
  );

  let trade = getExchangeInBasicPool(
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

  let history = getExchangeHistoryInBasicPool(event.block.timestamp, basicPool.id);
  trade.day = history.id;

  basicPool.save();
  position.save();
  trade.save();
  history.save();
}

export function onClose(event: PositionClosed): void {
  let basicPool = getBasicTraderPool(event.address);
  let positionOffset = getPositionOffset(basicPool.id, event.params.position);
  let position = getPositionInBasicPool(
    getPositionId(basicPool.id, event.params.position),
    basicPool.id,
    event.params.position
  );

  position.closed = true;
  positionOffset.offset = positionOffset.offset.plus(BigInt.fromI32(1));

  position.save();
  positionOffset.save();
}

export function onInvestorAdded(event: InvestorAdded): void {
  let investor = getInvestorInBasicPool(event.params.investor);
  let basicPool = getBasicTraderPool(event.address);
  investor.activePools.push(basicPool.id);
  investor.allPools.push(basicPool.id);
  investor.save();

  let basicPoolHistory = getBasicPoolHistory(event.block.timestamp, basicPool.id, basicPool.investors);
  basicPoolHistory.investors.push(investor.id);
  basicPoolHistory.save();

  basicPool.investors.push(investor.id);
  basicPool.save();
}

export function onInvest(event: Invested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let invest = getInvestInBasicPool(
    event.transaction.hash,
    investorInfo.id,
    event.params.amount,
    event.params.toMintLP
  );
  let history = getInvestHistoryInBasicPool(event.block.timestamp, event.address);
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
  let investor = getInvestorInBasicPool(event.params.investor);
  let basicPool = getBasicTraderPool(event.address);
  investor.activePools = removeByIndex(investor.activePools, investor.activePools.indexOf(basicPool.id));
  investor.save();

  let basicPoolHistory = getBasicPoolHistory(event.block.timestamp, basicPool.id, basicPool.investors);
  basicPoolHistory.investors = removeByIndex(
    basicPoolHistory.investors,
    basicPoolHistory.investors.indexOf(basicPool.id)
  );
  basicPoolHistory.save();

  basicPool.investors = removeByIndex(basicPool.investors, basicPool.investors.indexOf(investor.id));
  basicPool.save();
}

export function onDivest(event: Divested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let divest = getDivestInBasicPool(event.transaction.hash, investorInfo.id, event.params.amount);
  let history = getDivestHistoryInBasicPool(event.block.timestamp, event.address);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  investorInfo.totalDivestVolume = investorInfo.totalDivestVolume.plus(event.params.amount);
  history.totalDivestVolume = history.totalDivestVolume.plus(event.params.amount);
  divest.day = history.id;

  lpHistory.lpBalance.minus(event.params.amount);

  investorInfo.save();
  divest.save();
  history.save();
}

export function onTraderCommissionMinted(event: TraderCommissionMinted): void {
  let investorInfo = getInvestorInfo(event.params.trader, event.address);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  lpHistory.lpBalance.plus(event.params.amount);

  lpHistory.save();
  investorInfo.save();
}

export function onTraderCommissionPaid(event: TraderCommissionPaid): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  lpHistory.lpBalance.minus(event.params.amount);

  lpHistory.save();
  investorInfo.save();
}
