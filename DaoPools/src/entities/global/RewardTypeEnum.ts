import { BigInt } from "@graphprotocol/graph-ts";

export enum RewardType {
  CREATE = 0,
  VOTE_FOR = 1,
  VOTE_AGAINST = 2,
  VOTE_FOR_DELEGATED = 3,
  VOTE_AGAINST_DELEGATED = 4,
  VOTE_FOR_TREASURY = 5,
  VOTE_AGAINST_TREASURY = 6,
  EXECUTE = 7,
  SAVE_OFFCHAIN_RESULTS = 8,
}

export function getEnumBigInt(operation: RewardType): BigInt {
  return BigInt.fromI32(operation as i32);
}
