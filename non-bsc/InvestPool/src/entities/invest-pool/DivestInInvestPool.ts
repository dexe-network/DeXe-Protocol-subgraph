import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DivestInInvestPool } from "../../../generated/schema";

export function getDivestInInvestPool(
  hash: Bytes,
  investorInfoId: string = "",
  volumeBase: BigInt = BigInt.fromI32(0),
  commission: BigInt = BigInt.fromI32(0)
): DivestInInvestPool {
  let id = hash.toHex();
  let divest = DivestInInvestPool.load(id);

  if (divest == null) {
    divest = new DivestInInvestPool(id);

    divest.investor = investorInfoId;
    divest.volumeBase = volumeBase;
    divest.commission = commission;
    divest.day = "";
  }

  return divest;
}
