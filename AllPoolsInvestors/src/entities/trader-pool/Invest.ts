import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Invest, InvestorInfo } from "../../../generated/schema";

export function getInvest(
  hash: Bytes,
  investorInfoId: InvestorInfo,
  volumeBase: BigInt = BigInt.zero(),
  toMintLP: BigInt = BigInt.zero(),
  timestamp: BigInt = BigInt.zero()
): Invest {
  let id = hash.toHexString();
  let invest = Invest.load(id);

  if (invest == null) {
    invest = new Invest(id);

    invest.investor = investorInfoId.investor;
    invest.volumeBase = volumeBase;
    invest.lpPurchasePrice = volumeBase.div(toMintLP);
    invest.investorInfo = investorInfoId.id;
    invest.day = "";
    invest.timestamp = timestamp;
  }

  return invest;
}
