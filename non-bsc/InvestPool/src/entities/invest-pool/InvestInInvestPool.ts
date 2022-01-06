import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestInInvestPool } from "../../../generated/schema";

export function getInvestInInvestPool(
  hash: Bytes,
  investorInfoId: string = "",
  volumeBase: BigInt = BigInt.fromI32(0),
  toMintLP: BigInt = BigInt.fromI32(0),
): InvestInInvestPool {
  let id = hash.toHex();
  let invest = InvestInInvestPool.load(id);

  if (invest == null) {
    invest = new InvestInInvestPool(id);

    invest.investor = investorInfoId;
    invest.volumeBase = volumeBase;
    invest.lpPurchasePrice = volumeBase.div(toMintLP);
    invest.day = "";
  }

  return invest;
}
