import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestorInfo } from "../../../generated/schema";
import { getInvestTraderPool } from "./InvestTraderPool";

export function getInvestorInfo(investorAddress: Address, investPool: Address): InvestorInfo {
  let pool = getInvestTraderPool(investPool);
  let id = investorAddress.toHexString() + pool.id;
  let investorInfo = InvestorInfo.load(id);

  if (investorInfo == null) {
    investorInfo = new InvestorInfo(id);

    investorInfo.totalDivestVolume = BigInt.zero();
    investorInfo.totalInvestVolume = BigInt.zero();
  }
  return investorInfo;
}
