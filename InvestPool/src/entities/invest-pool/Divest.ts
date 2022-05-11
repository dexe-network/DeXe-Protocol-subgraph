import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Divest } from "../../../generated/schema";

export function getDivest(
  hash: Bytes,
  investorInfoId: string = "",
  volumeBase: BigInt = BigInt.zero(),
  commission: BigInt = BigInt.zero(),
  timestamp: BigInt = BigInt.zero()
): Divest {
  let id = hash.toHexString();
  let divest = Divest.load(id);

  if (divest == null) {
    divest = new Divest(id);

    divest.investor = investorInfoId;
    divest.volumeBase = volumeBase;
    divest.commission = commission;
    divest.day = "";
    divest.timestamp = timestamp;
  }

  return divest;
}
