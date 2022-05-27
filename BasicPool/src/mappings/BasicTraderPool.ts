import {
  InvestorAdded,
  Invested,
  InvestorRemoved,
  Divested,
  TraderCommissionMinted,
  TraderCommissionPaid,
  DescriptionURLChanged,
  ModifiedPrivateInvestors,
} from "../../generated/templates/BasicPool/BasicPool";
import { getBasicTraderPool } from "../entities/basic-pool/BasicTraderPool";
import { getInvest } from "../entities/basic-pool/Invest";
import { getInvestHistory } from "../entities/basic-pool/history/InvestHistory";
import { getDivest } from "../entities/basic-pool/Divest";
import { getDivestHistory } from "../entities/basic-pool/history/DivestHistory";
import { getInvestorInfo } from "../entities/basic-pool/InvestorInfo";
import { getBasicPoolHistory } from "../entities/basic-pool/history/BasicPoolHistory";
import { getInvestorLPHistory } from "../entities/basic-pool/history/InvestorLPHistory";
import { extendArray, reduceArray } from "../helpers/ArrayHelper";

export function onInvestorAdded(event: InvestorAdded): void {
  let pool = getBasicTraderPool(event.address);
  pool.investors = extendArray(pool.investors, [event.params.investor]);
  pool.save();
}

export function onInvest(event: Invested): void {
  let investorInfo = getInvestorInfo(event.params.investor, event.address);
  let invest = getInvest(
    event.transaction.hash,
    investorInfo.id,
    event.params.amount,
    event.params.toMintLP,
    event.block.timestamp
  );
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
  let divest = getDivest(event.transaction.hash, investorInfo.id, event.params.amount, event.block.timestamp);
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
