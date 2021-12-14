import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PositionInInvestPool } from "../../generated/schema";

export function getPositionInInvestPool(
  id: string,
  positionToken: Address,
  basicPoolId: string
): PositionInInvestPool {
  let position = PositionInInvestPool.load(id);

  if (position == null) {
    position = new PositionInInvestPool(id);

    position.positionToken = positionToken;
    position.totalOpenVolume = BigInt.fromI32(0);
    position.totalCloseVolume = BigInt.fromI32(0);
    position.averagePositionPriceInBase = BigInt.fromI32(0);
    position.investPool = basicPoolId;
    position.closed = false;
  }

  return position;
}
