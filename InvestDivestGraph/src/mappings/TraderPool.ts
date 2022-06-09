import { Invested, Divested } from "../../generated/templates/TraderPool/TraderPool";
import { getTraderPool } from "../entities/trader-pool/TraderPool";
import { getInvestor } from "../entities/trader-pool/Investor";
import { getInvestorInfo } from "../entities/trader-pool/InvestorInfo";
import { getInvest } from "../entities/trader-pool/Invest";
import { getInvestHistory } from "../entities/trader-pool/history/InvestHistory";
import { getDivest } from "../entities/trader-pool/Divest";
import { getDivestHistory } from "../entities/trader-pool/history/DivestHistory";

export function onInvest(event: Invested): void {
  let investor = getInvestor(event.params.investor);
  let pool = getTraderPool(event.address);
  let investorInfo = getInvestorInfo(investor, pool);
  let invest = getInvest(
    event.transaction.hash,
    investorInfo,
    event.params.amount,
    event.params.toMintLP,
    event.block.timestamp
  );
  let history = getInvestHistory(event.block.timestamp, pool);

  investorInfo.totalInvestVolume = investorInfo.totalInvestVolume.plus(event.params.amount);
  history.totalInvestVolume = history.totalInvestVolume.plus(event.params.amount);
  invest.day = history.id;

  investorInfo.save();
  history.save();
  invest.save();
}

export function onDivest(event: Divested): void {
  let investor = getInvestor(event.params.investor);
  let pool = getTraderPool(event.address);
  let investorInfo = getInvestorInfo(investor, pool);
  let divest = getDivest(
    event.transaction.hash,
    investorInfo,
    event.params.amount,
    event.params.commission,
    event.block.timestamp
  );
  let history = getDivestHistory(event.block.timestamp, pool);

  investorInfo.totalDivestVolume = investorInfo.totalDivestVolume.plus(event.params.amount);
  history.totalDivestVolume = history.totalDivestVolume.plus(event.params.amount);
  divest.day = history.id;

  investorInfo.save();
  history.save();
  divest.save();
}
