import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { GetPerformanceFee } from "../../../generated/schema";

export function getGetPerformanceFee(
  hash: Bytes,
  amountBase: BigInt,
  amountLP: BigInt,
  count: BigInt
): GetPerformanceFee {
  let id = hash.concatI32(count.toI32());
  let performanceFee = GetPerformanceFee.load(id);

  if (performanceFee == null) {
    performanceFee = new GetPerformanceFee(id);

    performanceFee.baseAmount = amountBase;
    performanceFee.lpAmount = amountLP;

    performanceFee.transaction = Bytes.empty();
  }

  return performanceFee;
}
