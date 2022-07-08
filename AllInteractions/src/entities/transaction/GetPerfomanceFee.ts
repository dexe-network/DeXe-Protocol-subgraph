import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { GetPerfomanceFee } from "../../../generated/schema";

export function getGetPerfomaneFee(hash: Bytes, amountBase: BigInt, amountLP: BigInt): GetPerfomanceFee {
  let perfomanceFee = GetPerfomanceFee.load(hash);

  if (perfomanceFee == null) {
    perfomanceFee = new GetPerfomanceFee(hash);

    perfomanceFee.baseAmount = amountBase;
    perfomanceFee.lpAmount = amountLP;

    perfomanceFee.transaction = Bytes.empty();
  }

  return perfomanceFee;
}
