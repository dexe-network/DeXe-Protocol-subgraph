import { InvestorInfo, Vest } from "../../../generated/schema";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

export function getVest(
  hash: Bytes,
  investorInfo: InvestorInfo,
  isInvest: boolean = false,
  volumeBase: BigInt = BigInt.zero(),
  volumeLP: BigInt = BigInt.zero(),
  volumeUSD: BigInt = BigInt.zero(),
  timestamp: BigInt = BigInt.zero()
): Vest {
  let vest = Vest.load(hash.toHexString());

  if (vest == null) {
    vest = new Vest(hash.toHexString());
    vest.investorInfo = investorInfo.id;
    vest.isInvest = isInvest;
    vest.volumeBase = volumeBase;
    vest.volumeLP = volumeLP;
    vest.volumeUSD = volumeUSD;
    vest.timestamp = timestamp;
  }

  return vest;
}
