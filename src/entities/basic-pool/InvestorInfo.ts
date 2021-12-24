import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestorInfo } from "../../../generated/schema";
import { getBasicTraderPool } from "./BasicTraderPool";
import { getInvestorInBasicPool } from "./InvestorInBasicPool";

export function getInvestorInfo(invesorAddress: Address, basicPool: Address): InvestorInfo {
  let investor = getInvestorInBasicPool(invesorAddress);
  let pool = getBasicTraderPool(basicPool);
  let id = investor.id+pool.id;
  let investorInfo = InvestorInfo.load(id);

  if (investorInfo == null) {
    investorInfo = new InvestorInfo(id.toString());

    investorInfo.totalDivestVolume = BigInt.fromI32(0);
    investorInfo.totalInvestVolume = BigInt.fromI32(0);
    investorInfo.basicPool = getBasicTraderPool(basicPool).id;
  }
  return investorInfo;
}
