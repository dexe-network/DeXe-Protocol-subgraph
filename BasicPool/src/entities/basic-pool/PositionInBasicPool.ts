import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PositionInBasicPool } from "../../../generated/schema";
import { getBasicTraderPool } from "./BasicTraderPool";

export function getPositionInBasicPool(
  id: string,
  basicPool: string = "",
  positionToken: Address = Address.zero()
): PositionInBasicPool {
  let position = PositionInBasicPool.load(id);

  if (position == null) {
    position = new PositionInBasicPool(id);

    position.positionToken = positionToken;
    position.totalOpenVolume = BigInt.zero();
    position.totalCloseVolume = BigInt.zero();
    position.basicPool = basicPool;
    position.closed = false;
  }

  return position;
}
