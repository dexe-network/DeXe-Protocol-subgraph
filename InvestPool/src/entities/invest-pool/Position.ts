import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Position } from "../../../generated/schema";

export function getPosition(id: string, investPool: string = ""): Position {
  let position = Position.load(id);

  if (position == null) {
    position = new Position(id);

    position.totalOpenVolume = BigInt.zero();
    position.totalCloseVolume = BigInt.zero();
    position.investPool = investPool;
    position.closed = false;
    position.liveTime = BigInt.zero();
    position.startTimestamp = BigInt.zero();
  }

  return position;
}
