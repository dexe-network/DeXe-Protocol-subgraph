import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestPool } from "../../../generated/schema";

export function getInvestTraderPool(
  poolAddress: Address,
  basicTokenAddress: Address = Address.zero(),
  ticker: string = "",
  name: string = "",
  creationTime: BigInt = BigInt.zero()
): InvestPool {
  let investPool = InvestPool.load(poolAddress.toHexString());

  if (investPool == null) {
    investPool = new InvestPool(poolAddress.toHexString());
    investPool.baseToken = basicTokenAddress;
    investPool.investors = new Array<string>();
    investPool.ticker = ticker;
    investPool.name = name;
    investPool.creationTime = creationTime;
  }

  return investPool;
}
