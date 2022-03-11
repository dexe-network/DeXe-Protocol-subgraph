import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Position } from "../../../generated/schema";
import { getBasicTraderPool } from "./BasicTraderPool";

export function getPosition(id: string, basicPool: string = "", positionToken: Address = Address.zero()): Position {
  let position = Position.load(id);

  if (position == null) {
    position = new Position(id);

    position.positionToken = positionToken;
    position.totalOpenVolume = BigInt.zero();
    position.totalCloseVolume = BigInt.zero();
    position.basicPool = basicPool;
    position.closed = false;
    position.liveTime = BigInt.zero();
    position.startTimestamp = BigInt.zero();
  }

  return position;
}
