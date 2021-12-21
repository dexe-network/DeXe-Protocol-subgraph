import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DivestInBasicPool } from "../../../generated/schema";
import { getDivestHistoryInBasicPool } from "./history/DivestHistoryInBasicPool";
import { getInvestorBasicPool } from "./InvestorBasicPool";

export function getDivestInBasicPool(
  id: string,
  investor: Address = Address.zero(),
  volumeBase: BigInt = BigInt.fromI32(0),
  commission: BigInt = BigInt.fromI32(0),
  timestamp: BigInt = BigInt.fromI32(0)
): DivestInBasicPool {
  let divest = DivestInBasicPool.load(id);

  if (divest == null) {
    divest = new DivestInBasicPool(id);

    divest.investor = getInvestorBasicPool(investor).id;
    divest.volumeBase = volumeBase;
    divest.commission = commission;
    divest.day = getDivestHistoryInBasicPool(timestamp).id;
  }

  return divest;
}
