import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestInBasicPool } from "../../../generated/schema";
import { getInvestHistoryInBasicPool } from "./history/InvestHistoryInBasicPool";
import { getInvestorBasicPool } from "./InvestorBasicPool";

export function getInvestInBasicPool(
  id: string,
  investor: Address = Address.zero(),
  volumeBase: BigInt = BigInt.fromI32(0),
  lpPurchasePrice: BigInt = BigInt.fromI32(0),
  timestamp: BigInt = BigInt.fromI32(0)
): InvestInBasicPool {
  let invest = InvestInBasicPool.load(id);

  if (invest == null) {
    invest = new InvestInBasicPool(id);

    invest.investor = getInvestorBasicPool(investor).id;
    invest.volumeBase = volumeBase;
    invest.lpPurchasePrice = lpPurchasePrice;
    invest.day = getInvestHistoryInBasicPool(timestamp).id;
  }

  return invest;
}
