import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PositionInBasicPool } from "../../generated/schema";

export function getPositionInBasicPool(
  id: String,
  positionToken: Address,
  basicPoolId: String
): PositionInBasicPool {
  let position = PositionInBasicPool.load(id);

  if (position == null) {
    position = new PositionInBasicPool(id);

    position.positionToken = positionToken;
    position.totalVolumeFrom = BigInt.fromI32(0);
    position.totalVolumeTo = BigInt.fromI32(0);
    position.averagePositionPriceInBase = BigInt.fromI32(0);
    position.basicPoolId = basicPoolId;
  }

  return position;
}
