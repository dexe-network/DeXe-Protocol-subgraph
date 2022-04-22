import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestorInfo } from "../../../generated/schema";
import { getBasicTraderPool } from "./BasicTraderPool";

export function getInvestorInfo(investorAddress: Address, basicPool: Address): InvestorInfo {
  let pool = getBasicTraderPool(basicPool);
  let id = investorAddress.toHexString() + pool.id;
  let investorInfo = InvestorInfo.load(id);

  if (investorInfo == null) {
    investorInfo = new InvestorInfo(id);

    investorInfo.totalDivestVolume = BigInt.zero();
    investorInfo.totalInvestVolume = BigInt.zero();
  }
  return investorInfo;
}
