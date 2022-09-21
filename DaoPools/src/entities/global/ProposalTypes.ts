import { BigInt } from "@graphprotocol/graph-ts";

export enum ProposalType {
  DEFAULT,
  DISTRIBUTION,
}

export function getEnumBigInt(operation: ProposalType): BigInt {
  return BigInt.fromI32(operation as i32);
}
