import { Address } from "@graphprotocol/graph-ts";
import { getPositionOffset } from "../entities/global/PositionOffset";

export function getPositionId(poolId: string, token: Address): string {
  
  let positionOffset = getPositionOffset(poolId, token);
  let positionId = positionOffset.id + positionOffset.offset.toString();

  return positionId;
}
