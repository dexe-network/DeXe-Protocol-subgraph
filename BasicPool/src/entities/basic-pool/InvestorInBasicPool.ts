import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestorInBasicPool } from "../../../generated/schema";

export function getInvestorInBasicPool(id: Address): InvestorInBasicPool {
  let investor = InvestorInBasicPool.load(id.toString());

  if (investor == null) {
    investor = new InvestorInBasicPool(id.toString());
    investor.insurance = BigInt.zero();
    investor.insurancePayout = BigInt.zero();
    investor.activePools = new Array();
    investor.allPools = new Array();
  }

  return investor;
}
