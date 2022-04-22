import { Address } from "@graphprotocol/graph-ts";
import { Position } from "../../../generated/schema";

export function getPosition(id: string, basicPool: string = "", positionToken: Address = Address.zero()): Position {
  let position = Position.load(id);

  if (position == null) {
    position = new Position(id);
    position.basicPool = basicPool;
    position.closed = false;
    position.positionToken = positionToken;
  }

  return position;
}
