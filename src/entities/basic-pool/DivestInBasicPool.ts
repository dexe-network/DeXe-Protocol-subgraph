import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DivestInBasicPool } from "../../../generated/schema";
import { getInvestorInfo } from "./InvestorInfo";

export function getDivestInBasicPool(
  hash: Bytes,
  investorInfoId: string = "",
  volumeBase: BigInt = BigInt.fromI32(0),
  commission: BigInt = BigInt.fromI32(0)
): DivestInBasicPool {
  let id = hash.toHex();
  let divest = DivestInBasicPool.load(id);

  if (divest == null) {
    divest = new DivestInBasicPool(id);

    divest.investor = investorInfoId;
    divest.volumeBase = volumeBase;
    divest.commission = commission;
    divest.day = "";
  }

  return divest;
}
