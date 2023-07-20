import { BigInt } from "@graphprotocol/graph-ts";

export enum DelegationType {
  DELEGATE = 1,
  UNDELEGATE = 2,
  REQUEST = 3,
}

export function getEnumBigInt(operation: DelegationType): BigInt {
  return BigInt.fromI32(operation as i32);
}
