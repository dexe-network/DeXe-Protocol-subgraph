import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investor, InvestorInfo, TraderPool } from "../../../generated/schema";

export function getInvestorInfo(investor: Investor, traderPool: TraderPool): InvestorInfo {
  let id = investor.id + traderPool.id;
  let investorInfo = InvestorInfo.load(id);

  if (investorInfo == null) {
    investorInfo = new InvestorInfo(id);
    investorInfo.investor = investor.id;
    investorInfo.pool = traderPool.id;
    investorInfo.totalDivestVolume = BigInt.zero();
    investorInfo.totalInvestVolume = BigInt.zero();
  }
  return investorInfo;
}
