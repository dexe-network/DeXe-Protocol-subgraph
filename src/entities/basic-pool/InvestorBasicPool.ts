import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestorBasicPool } from "../../../generated/schema";
import { getBasicTraderPool } from "./BasicTraderPool";

export function getInvestorBasicPool(id: Address, basicPool: Address = Address.zero()): InvestorBasicPool {
  let investor = InvestorBasicPool.load(id.toString());

  if (investor == null) {
    investor = new InvestorBasicPool(id.toString());

    investor.totalDivestVolume = BigInt.fromI32(0);
    investor.totalInvestVolume = BigInt.fromI32(0);
    investor.basicPool = getBasicTraderPool(basicPool).id;
  }
  return investor;
}
