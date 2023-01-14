import { BigInt } from "@graphprotocol/graph-ts";
import { MAX_SEARCH_DEPTH } from "../entities/global/globals";

export function findPrevHistory<T>(
  loadFunction: (id: string) => T | null,
  idBase: string,
  idSuffix: BigInt,
  decrement: BigInt
): T | null {
  let newSuffix = idSuffix.minus(decrement);
  let history = loadFunction(idBase + newSuffix.toString());

  while (
    history == null &&
    newSuffix.gt(BigInt.zero()) &&
    idSuffix.minus(newSuffix).div(decrement).le(BigInt.fromI32(MAX_SEARCH_DEPTH))
  ) {
    newSuffix = newSuffix.minus(decrement);
    history = loadFunction(idBase + newSuffix.toString());
  }

  return history;
}
