import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestorInfo } from "../../../generated/schema";
import { getBasicTraderPool } from "./BasicTraderPool";
import { getInvestor } from "./Investor";

export function getInvestorInfo(investorAddress: Address, basicPool: Address): InvestorInfo {
  let investor = getInvestor(investorAddress);
  let pool = getBasicTraderPool(basicPool);
  let id = investor.id + pool.id;
  let investorInfo = InvestorInfo.load(id);

  if (investorInfo == null) {
    investorInfo = new InvestorInfo(id.toString());

    investorInfo.totalDivestVolume = BigInt.fromI32(0);
    investorInfo.totalInvestVolume = BigInt.fromI32(0);
  }
  return investorInfo;
}
