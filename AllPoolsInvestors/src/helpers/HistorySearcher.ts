import { BigInt } from "@graphprotocol/graph-ts";

export function findPrevHistory<T>(
  loadFunction: (id: string) => T | null,
  idBase: string,
  idSuffix: BigInt,
  decrement: BigInt
): T | null {
  let newSuffix = idSuffix.minus(decrement);
  let history = loadFunction(idBase + newSuffix.toString());

  while (history == null && newSuffix.gt(BigInt.zero())) {
    newSuffix = newSuffix.minus(decrement);
    history = loadFunction(idBase + newSuffix.toString());
  }

  return history;
}
