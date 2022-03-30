import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Position } from "../../../generated/schema";
import { getTraderPool } from "./TraderPool";

export function getPosition(id: string, traderPool: string = "", positionToken: Address = Address.zero()): Position {
  let position = Position.load(id);

  if (position == null) {
    position = new Position(id);

    position.positionToken = positionToken;
    position.totalOpenVolume = BigInt.zero();
    position.totalCloseVolume = BigInt.zero();
    position.traderPool = traderPool;
    position.closed = false;
    position.liveTime = BigInt.zero();
    position.startTimestamp = BigInt.zero();
  }

  return position;
}
