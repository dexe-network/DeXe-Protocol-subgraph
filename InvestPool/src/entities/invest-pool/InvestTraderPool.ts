import { Address } from "@graphprotocol/graph-ts";
import { InvestPool } from "../../../generated/schema";

export function getInvestTraderPool(poolAddress: Address, basicTokenAddress: Address = Address.zero()): InvestPool {
  let investPool = InvestPool.load(poolAddress.toHexString());

  if (investPool == null) {
    investPool = new InvestPool(poolAddress.toHexString());
    investPool.baseToken = basicTokenAddress;
  }

  return investPool;
}
