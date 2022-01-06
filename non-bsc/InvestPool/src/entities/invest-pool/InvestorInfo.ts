import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestorInfo } from "../../../generated/schema";
import { getBasicTraderPool } from "./InvestTraderPool";
import { getInvestorInInvestPool } from "./InvestorInInvestPool";

export function getInvestorInfo(invesorAddress: Address, InvestPool: Address): InvestorInfo {
  let investor = getInvestorInInvestPool(invesorAddress);
  let pool = getBasicTraderPool(InvestPool);
  let id = investor.id+pool.id;
  let investorInfo = InvestorInfo.load(id);

  if (investorInfo == null) {
    investorInfo = new InvestorInfo(id.toString());

    investorInfo.totalDivestVolume = BigInt.fromI32(0);
    investorInfo.totalInvestVolume = BigInt.fromI32(0);
  }
  return investorInfo;
}
