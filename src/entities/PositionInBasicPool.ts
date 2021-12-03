import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PositionInBasicPool } from "../../generated/schema";

export function getPositionInBasicPool(
  id: string,
  positionToken: Address,
  basicPoolId: string
): PositionInBasicPool {
  let position = PositionInBasicPool.load(id);

  if (position == null) {
    position = new PositionInBasicPool(id);

    position.positionToken = positionToken;
    position.totalOpenVolume = BigInt.fromI32(0);
    position.totalCloseVolume = BigInt.fromI32(0);
    position.averagePositionPriceInBase = BigInt.fromI32(0);
    position.basicPool = basicPoolId;
    position.closed = false;
  }

  return position;
}
