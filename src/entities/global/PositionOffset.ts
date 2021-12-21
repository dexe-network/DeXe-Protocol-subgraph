import { BigInt } from "@graphprotocol/graph-ts";
import { PositionOffset } from "../../../generated/schema";

export function getPositionOffset(id: string): PositionOffset {
  let positionOffset = PositionOffset.load(id);

  if (positionOffset == null) {
    positionOffset = new PositionOffset(id);

    positionOffset.offset = BigInt.fromI32(0);
  }

  return positionOffset;
}
