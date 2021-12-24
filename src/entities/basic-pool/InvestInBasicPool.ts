import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestInBasicPool } from "../../../generated/schema";

export function getInvestInBasicPool(
  hash: Bytes,
  investorInfoId: string = "",
  volumeBase: BigInt = BigInt.fromI32(0),
  lpPurchasePrice: BigInt = BigInt.fromI32(0),
): InvestInBasicPool {
  let id = hash.toHex();
  let invest = InvestInBasicPool.load(id);

  if (invest == null) {
    invest = new InvestInBasicPool(id);

    invest.investor = investorInfoId;
    invest.volumeBase = volumeBase;
    invest.lpPurchasePrice = lpPurchasePrice;
    invest.day = "";
  }

  return invest;
}
