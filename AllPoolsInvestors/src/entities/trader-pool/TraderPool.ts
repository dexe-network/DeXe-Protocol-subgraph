import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TraderPool } from "../../../generated/schema";

export function getTraderPool(
  poolAddress: Address,
  proposalContract: Address = Address.zero(),
  type: string = "",
  baseToken: Address = Address.zero(),
  creationTime: BigInt = BigInt.zero(),
  block: BigInt = BigInt.zero()
): TraderPool {
  let traderPool = TraderPool.load(poolAddress.toHexString());

  if (traderPool == null) {
    traderPool = new TraderPool(poolAddress.toHexString());
    traderPool.proposalContract = proposalContract;
    traderPool.type = type;
    traderPool.token = baseToken;
    traderPool.creationTime = creationTime;
    traderPool.creationBlock = block;
  }

  return traderPool;
}
