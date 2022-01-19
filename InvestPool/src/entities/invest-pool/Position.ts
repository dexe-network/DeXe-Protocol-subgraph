import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Position } from "../../../generated/schema";
import { getInvestTraderPool } from "./InvestTraderPool";

export function getPosition(id: string, investPool: string = "", positionToken: Address = Address.zero()): Position {
  let position = Position.load(id);

  if (position == null) {
    position = new Position(id);

    position.positionToken = positionToken;
    position.totalOpenVolume = BigInt.zero();
    position.totalCloseVolume = BigInt.zero();
    position.investPool = investPool;
    position.closed = false;
  }

  return position;
}
