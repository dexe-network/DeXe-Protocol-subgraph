import { Address, BigInt} from "@graphprotocol/graph-ts";
import { InvestPool } from "../../../generated/schema"; 

export function getInvestTraderPool(
  poolAddress: Address,
  basicTokenAddress: Address = Address.zero(),
  ticker: string = "",
  name: string = "",
  creatingTime: BigInt = BigInt.zero()
): InvestPool {
  let investPool = InvestPool.load(poolAddress.toHex());

  if (investPool == null) {
    investPool = new InvestPool(poolAddress.toHex());
    investPool.baseToken = basicTokenAddress;
    investPool.investors = new Array<string>();
    investPool.ticker = ticker;
    investPool.name = name;
    investPool.creatingTime = creatingTime;
  }

  return investPool;
}