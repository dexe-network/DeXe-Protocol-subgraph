import { Address} from "@graphprotocol/graph-ts";
import { BasicPool } from "../../generated/schema"; 

export function getBasicTraderPool(
  poolAddress: Address,
  basicTokenAddress: Address = Address.zero()
): BasicPool {
  let basicPool = BasicPool.load(poolAddress.toHex());

  if (basicPool == null) {
    basicPool = new BasicPool(poolAddress.toHex());

    basicPool.baseToken = basicTokenAddress;
  }

  return basicPool;
}
