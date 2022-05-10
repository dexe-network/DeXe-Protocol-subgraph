import {
  InvestorAdded,
  Invested,
  InvestorRemoved,
  Divested,
  TraderCommissionMinted,
  TraderCommissionPaid,
  DescriptionURLChanged,
} from "../../generated/templates/InvestPool/InvestPool";
import { getInvestTraderPool } from "../entities/invest-pool/InvestTraderPool";
import { getInvest } from "../entities/invest-pool/Invest";
import { getInvestHistory } from "../entities/invest-pool/history/InvestHistory";
import { getDivest } from "../entities/invest-pool/Divest";
import { getDivestHistory } from "../entities/invest-pool/history/DivestHistory";
import { getInvestorInfo } from "../entities/invest-pool/InvestorInfo";
import { extendArray, reduceArray } from "../helpers/ArrayHelper";
import { getInvestPoolHistory } from "../entities/invest-pool/history/InvestPoolHistory";
import { getInvestorLPHistory } from "../entities/invest-pool/history/InvestorLPHistory";

export function onInvestorAdded(event: InvestorAdded): void {
  let pool = getInvestTraderPool(event.address);
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
  let investPool = getInvestTraderPool(event.address);

  let investPoolHistory = getInvestPoolHistory(event.block.timestamp, investPool.id, investPool.investors);
  investPoolHistory.investors = reduceArray(investPoolHistory.investors, [event.params.investor]);
  investPoolHistory.save();

  investPool.investors = reduceArray(investPool.investors, [event.params.investor]);
  investPool.save();
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
  lpHistory.save();
}

export function onMintLP(event: TraderCommissionMinted): void {
  let investorInfo = getInvestorInfo(event.params.trader, event.address);
  let lpHistory = getInvestorLPHistory(event.block.timestamp, investorInfo.id);

  lpHistory.lpBalance = lpHistory.lpBalance.plus(event.params.amount);

  lpHistory.save();
  investorInfo.save();
}

export function onBurnLP(event: TraderCommissionPaid): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
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
