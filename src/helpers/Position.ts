import { Address } from "@graphprotocol/graph-ts";
import { getPositionOffset } from "../entities/global/PositionOffset";

export function getPositionId(pool: Address, position: Address): string {
  let positionOffsetId = pool.toString() + position.toString();
  let positionOffset = getPositionOffset(positionOffsetId);
  let positionId = positionOffsetId + positionOffset.offset.toString();

  return positionId;
}
