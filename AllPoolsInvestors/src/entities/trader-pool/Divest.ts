import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Divest, InvestorInfo } from "../../../generated/schema";
import { DAY } from "../global/globals";

export function getDivest(
  hash: Bytes,
  investorInfo: InvestorInfo,
  volumeBase: BigInt = BigInt.zero(),
  commission: BigInt = BigInt.zero(),
  timestamp: BigInt = BigInt.zero()
): Divest {
  let id = hash.toHexString();
  let divest = Divest.load(id);

  if (divest == null) {
    divest = new Divest(id);

    divest.investor = investorInfo.investor;
    divest.investorInfo = investorInfo.id;
    divest.volumeBase = volumeBase;
    divest.commission = commission;
    divest.day = "";
    divest.timestamp = timestamp;
  }

  return divest;
}
