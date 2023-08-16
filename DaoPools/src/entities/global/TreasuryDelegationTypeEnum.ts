import { BigInt } from "@graphprotocol/graph-ts";

export enum TreasuryDelegationType {
  DELEGATE = 1,
  UNDELEGATE = 2,
}

export function getEnumBigInt(operation: TreasuryDelegationType): BigInt {
  return BigInt.fromI32(operation as i32);
}
