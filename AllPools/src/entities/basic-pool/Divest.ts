import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Divest } from "../../../generated/schema";

export function getDivest(
  hash: Bytes,
  investorInfoId: string = "",
  volumeBase: BigInt = BigInt.fromI32(0),
  commission: BigInt = BigInt.fromI32(0)
): Divest {
  let id = hash.toHexString();
  let divest = Divest.load(id);

  if (divest == null) {
    divest = new Divest(id);

    divest.investor = investorInfoId;
    divest.volumeBase = volumeBase;
    divest.commission = commission;
    divest.day = "";
  }

  return divest;
}
