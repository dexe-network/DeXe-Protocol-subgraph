import { Address} from "@graphprotocol/graph-ts";
import { InvestPool } from "../../../generated/schema"; 
import { getInvestPoolRegistry } from "./InvestPoolRegistry";

export function getBasicTraderPool(
  poolAddress: Address,
  basicTokenAddress: Address = Address.zero(),
  ticker: string = ""
): InvestPool {
  let investPool = InvestPool.load(poolAddress.toHex());

  if (investPool == null) {
    investPool = new InvestPool(poolAddress.toHex());
    investPool.baseToken = basicTokenAddress;
    investPool.investors = new Array<string>();
    investPool.ticker = ticker;

    let bpr = getInvestPoolRegistry();
    bpr.pools.push(investPool.id);
    bpr.save();
  }

  return investPool;
}

export function getBasicTraderPoolById(id: string): InvestPool{
  let investPool = InvestPool.load(id);
  if(investPool == null){
    investPool = new InvestPool(Address.zero().toString());
    investPool.baseToken = Address.zero();
    investPool.investors = new Array<string>();
    investPool.ticker = "";
  }
  return investPool;
}