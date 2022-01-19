import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestorInfo } from "../../../generated/schema";
import { getInvestTraderPool } from "./InvestTraderPool";
import { getInvestor } from "./Investor";

export function getInvestorInfo(investorAddress: Address, investPool: Address): InvestorInfo {
  let investor = getInvestor(investorAddress);
  let pool = getInvestTraderPool(investPool);
  let id = investor.id + pool.id;
  let investorInfo = InvestorInfo.load(id);

  if (investorInfo == null) {
    investorInfo = new InvestorInfo(id.toString());

    investorInfo.totalDivestVolume = BigInt.fromI32(0);
    investorInfo.totalInvestVolume = BigInt.fromI32(0);
  }
  return investorInfo;
}
