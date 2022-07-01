import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { GetPerfomanceFee } from "../../../generated/schema";

export function getGetPerfomaneFee(hash: Bytes, amount: BigInt): GetPerfomanceFee {
  let perfomanceFee = GetPerfomanceFee.load(hash.toHexString());

  if (perfomanceFee == null) {
    perfomanceFee = new GetPerfomanceFee(hash.toHexString());

    perfomanceFee.amount = amount;

    perfomanceFee.transaction = "";
  }

  return perfomanceFee;
}
