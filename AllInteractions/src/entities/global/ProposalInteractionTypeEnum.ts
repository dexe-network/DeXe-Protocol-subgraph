import { BigInt } from "@graphprotocol/graph-ts";

export enum ProposalInteractionType {
  VOTE_FOR = 1,
  VOTE_AGAINST = 2,
  VOTE_CANCEL = 3,
}

export function getEnumBigInt(operation: ProposalInteractionType): BigInt {
  return BigInt.fromI32(operation as i32);
}
