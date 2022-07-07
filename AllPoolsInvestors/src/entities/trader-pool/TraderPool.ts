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
    traderPool.investors = new Array<string>();
    traderPool.investorsCount = BigInt.zero();
    traderPool.privateInvestors = new Array<string>();
    traderPool.privateInvestorsCount = BigInt.zero();
  }

  return traderPool;
}
