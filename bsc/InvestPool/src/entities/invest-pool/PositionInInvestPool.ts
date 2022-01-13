import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PositionInInvestPool } from "../../../generated/schema";
import { getInvestTraderPool } from "./InvestTraderPool";

export function getPositionInInvestPool(
  id: string,
  investPool: Address = Address.zero(),
  positionToken: Address = Address.zero(),
): PositionInInvestPool {
  let position = PositionInInvestPool.load(id);

  if (position == null) {
    position = new PositionInInvestPool(id);

    position.positionToken = positionToken;
    position.totalOpenVolume = BigInt.zero();
    position.totalCloseVolume = BigInt.zero();
    position.investPool = getInvestTraderPool(investPool).id;
    position.closed = false;
  }

  return position;
}
