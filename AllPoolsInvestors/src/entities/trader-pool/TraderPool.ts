import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TraderPool } from "../../../generated/schema";

export function getTraderPool(
  poolAddress: Address,
  proposalContract: Address = Address.zero(),
  type: string = "",
  baseToken: Address = Address.zero()
): TraderPool {
  let traderPool = TraderPool.load(poolAddress);

  if (traderPool == null) {
    traderPool = new TraderPool(poolAddress);
    traderPool.proposalContract = proposalContract;
    traderPool.type = type;
    traderPool.token = baseToken;
    traderPool.investors = new Array<Bytes>();
    traderPool.investorsCount = BigInt.zero();
    traderPool.privateInvestors = new Array<Bytes>();
    traderPool.privateInvestorsCount = BigInt.zero();
  }

  return traderPool;
}
