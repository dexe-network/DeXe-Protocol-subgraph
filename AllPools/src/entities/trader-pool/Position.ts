import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Position } from "../../../generated/schema";

export function getPosition(id: string, traderPool: string = "", positionToken: Address = Address.zero()): Position {
  let position = Position.load(id);

  if (position == null) {
    position = new Position(id);

    position.positionToken = positionToken;
    position.totalBaseOpenVolume = BigInt.zero();
    position.totalBaseCloseVolume = BigInt.zero();
    position.totalPositionOpenVolume = BigInt.zero();
    position.totalPositionCloseVolume = BigInt.zero();
    position.traderPool = traderPool;
    position.closed = false;
    position.liveTime = BigInt.zero();
    position.startTimestamp = BigInt.zero();
  }

  return position;
}
