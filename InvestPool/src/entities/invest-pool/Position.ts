import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Position } from "../../../generated/schema";

export function getPosition(id: string, investPool: string = "", positionToken: Address = Address.zero()): Position {
  let position = Position.load(id);

  if (position == null) {
    position = new Position(id);
    position.investPool = investPool;
    position.closed = false;
    position.positionToken = positionToken;
  }

  return position;
}
