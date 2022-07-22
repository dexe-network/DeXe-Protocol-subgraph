import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { GetPerfomanceFee } from "../../../generated/schema";

export function getGetPerfomaneFee(hash: Bytes, amountBase: BigInt, amountLP: BigInt, count: BigInt): GetPerfomanceFee {
  let id = hash.concatI32(count.toI32());
  let perfomanceFee = GetPerfomanceFee.load(id);

  if (perfomanceFee == null) {
    perfomanceFee = new GetPerfomanceFee(id);

    perfomanceFee.baseAmount = amountBase;
    perfomanceFee.lpAmount = amountLP;

    perfomanceFee.transaction = Bytes.empty();
  }

  return perfomanceFee;
}
