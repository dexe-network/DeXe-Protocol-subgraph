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
} from "../../generated/templates/InvestPool/InvestPool";
import { getInvestTraderPool } from "../entities/invest-pool/InvestTraderPool";
import { getPositionOffset } from "../entities/global/PositionOffset";
import { getPosition } from "../entities/invest-pool/Position";
import { getExchange } from "../entities/invest-pool/Exchange";
import { getInvest } from "../entities/invest-pool/Invest";
import { BigInt } from "@graphprotocol/graph-ts";
import { getPositionId } from "../helpers/Position";
import { getInvestHistory } from "../entities/invest-pool/history/InvestHistory";
import { getExchangeHistory } from "../entities/invest-pool/history/ExchangeHistory";
import { getInvestor } from "../entities/invest-pool/Investor";
import { getDivest } from "../entities/invest-pool/Divest";
import { getDivestHistory } from "../entities/invest-pool/history/DivestHistory";
import { getInvestorInfo } from "../entities/invest-pool/InvestorInfo";
import { removeByIndex } from "../helpers/ArrayHelper";
import { getInvestPoolHistory } from "../entities/invest-pool/history/InvestPoolHistory";
import { getInvestorLPHistory } from "../entities/invest-pool/history/InvestorLPHistory";

export function onExchange(event: Exchanged): void {
  let investPool = getInvestTraderPool(event.address);

  let position = getPosition(getPositionId(investPool.id, event.params.toToken), investPool.id);

  let trade = getExchange(
    event.transaction.hash,
    position.id,
    event.params.fromToken,
    event.params.toToken,
    event.params.fromVolume,
    event.params.toVolume
  );

  let history = getExchangeHistory(event.block.timestamp, investPool.id);
  trade.day = history.id;

  investPool.save();
  position.save();
  trade.save();
  history.save();
}

export function onClose(event: PositionClosed): void {
  let investPool = getInvestTraderPool(event.address);
  let positionOffset = getPositionOffset(investPool.id, event.params.position);
  let position = getPosition(getPositionId(investPool.id, event.params.position), investPool.id);

  position.closed = true;
  positionOffset.offset = positionOffset.offset.plus(BigInt.fromI32(1));

  investPool.save();

  position.save();
  positionOffset.save();
}

export function onInvestorAdded(event: InvestorAdded): void {
  let investor = getInvestor(event.params.investor, event.address, event.block.timestamp);
  investor.save();
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

  investorInfo.save();
  invest.save();
  history.save();
  lpHistory.save();
}

export function onInvestorRemoved(event: InvestorRemoved): void {
  let investor = getInvestor(event.params.investor, event.address, event.block.timestamp);
  let investPool = getInvestTraderPool(event.address);
  investor.activePools = removeByIndex(investor.activePools, investor.activePools.indexOf(investPool.id));
  investor.save();

  let investPoolHistory = getInvestPoolHistory(event.block.timestamp, investPool.id, investPool.investors);
  investPoolHistory.investors = removeByIndex(
    investPoolHistory.investors,
    investPoolHistory.investors.indexOf(investPool.id)
  );
  investPoolHistory.save();

  investPool.investors = removeByIndex(investPool.investors, investPool.investors.indexOf(investor.id));
  investPool.save();
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

  investorInfo.save();
  divest.save();
  history.save();
}

export function onMintLP(event: TraderCommissionMinted): void {
  let investorInfo = getInvestorInfo(event.params.trader, event.address, event.block.timestamp);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  lpHistory.lpBalance = lpHistory.lpBalance.plus(event.params.amount);

  lpHistory.save();
  investorInfo.save();
}

export function onBurnLP(event: TraderCommissionPaid): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address, event.block.timestamp);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  lpHistory.lpBalance = lpHistory.lpBalance.minus(event.params.amount);

  lpHistory.save();
  investorInfo.save();
}

export function onDescriptionURLChanged(event: DescriptionURLChanged): void {
  let pool = getInvestTraderPool(event.address);
  pool.descriptionURL = event.params.descriptionURL;
  pool.save();
}
