import { BigInt } from "@graphprotocol/graph-ts";
import { PositionOffsetInBasicPool } from "../../generated/schema";

export function getPositionOffsetInBasicPool(id: string): PositionOffsetInBasicPool {
  let positionOffset = PositionOffsetInBasicPool.load(id);

  if (positionOffset == null) {
    positionOffset = new PositionOffsetInBasicPool(id);

    positionOffset.offset = BigInt.fromI32(0);
  }

  return positionOffset;
}
