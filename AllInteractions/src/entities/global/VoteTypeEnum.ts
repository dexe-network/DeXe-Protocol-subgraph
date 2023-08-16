import { BigInt } from "@graphprotocol/graph-ts";

export enum VoteType {
  PERSONAL = 1,
  MICROPOOL = 2,
  DELEGATED = 3,
  TREASURY = 4,
}

export function getEnumBigInt(operation: VoteType): BigInt {
  return BigInt.fromI32(operation as i32);
}
