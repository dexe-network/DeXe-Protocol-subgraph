import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TraderPool } from "../../../generated/schema";

export function getTraderPool(
  poolAddress: Address,
  proposalContract: Address = Address.zero(),
  type: string = "",
  baseToken: Address = Address.zero()
): TraderPool {
  let traderPool = TraderPool.load(poolAddress.toHexString());

  if (traderPool == null) {
    traderPool = new TraderPool(poolAddress.toHexString());
    traderPool.proposalContract = proposalContract;
    traderPool.type = type;
    traderPool.token = baseToken;
  }

  return traderPool;
}
