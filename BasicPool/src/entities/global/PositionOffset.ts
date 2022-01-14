import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PositionOffset } from "../../../generated/schema";

export function getPositionOffset(poolId: string, token: Address): PositionOffset {
  let id = poolId + token.toHex();
  let positionOffset = PositionOffset.load(id);

  if (positionOffset == null) {
    positionOffset = new PositionOffset(id);

    positionOffset.offset = BigInt.zero();
  }

  return positionOffset;
}
