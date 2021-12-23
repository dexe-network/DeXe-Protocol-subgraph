import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestInBasicPool } from "../../../generated/schema";
import { getInvestorBasicPool } from "./InvestorBasicPool";

export function getInvestInBasicPool(
  hash: Bytes,
  investor: Address = Address.zero(),
  volumeBase: BigInt = BigInt.fromI32(0),
  lpPurchasePrice: BigInt = BigInt.fromI32(0),
): InvestInBasicPool {
  let id = hash.toHex();
  let invest = InvestInBasicPool.load(id);

  if (invest == null) {
    invest = new InvestInBasicPool(id);

    invest.investor = getInvestorBasicPool(investor).id;
    invest.volumeBase = volumeBase;
    invest.lpPurchasePrice = lpPurchasePrice;
    invest.day = "";
  }

  return invest;
}
