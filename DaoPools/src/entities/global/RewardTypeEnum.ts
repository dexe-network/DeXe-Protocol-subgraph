import { BigInt } from "@graphprotocol/graph-ts";

export enum RewardType {
  CREATE = 0,
  VOTE = 1,
  EXECUTE = 2,
  SAVE_OFFCHAIN_RESULTS = 3,
}

export function getEnumBigInt(operation: RewardType): BigInt {
  return BigInt.fromI32(operation as i32);
}
