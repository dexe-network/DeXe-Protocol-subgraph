import { Address} from "@graphprotocol/graph-ts";
import { BasicPool } from "../../../generated/schema"; 
import { getBasicPoolRegistry } from "./BasicPoolRegistry";

export function getBasicTraderPool(
  poolAddress: Address,
  basicTokenAddress: Address = Address.zero(),
  ticker: string = ""
): BasicPool {
  let basicPool = BasicPool.load(poolAddress.toHex());

  if (basicPool == null) {
    basicPool = new BasicPool(poolAddress.toHex());
    basicPool.baseToken = basicTokenAddress;
    basicPool.investors = new Array<string>();
    basicPool.ticker = ticker;

    let bpr = getBasicPoolRegistry();
    bpr.pools.push(basicPool.id);
    bpr.save();
  }

  return basicPool;
}

export function getBasicTraderPoolById(id: string): BasicPool{
  let basicPool = BasicPool.load(id);
  if(basicPool == null){
    basicPool = new BasicPool(Address.zero().toString());
    basicPool.baseToken = Address.zero();
    basicPool.investors = new Array<string>();
    basicPool.ticker = "";
  }
  return basicPool;
}