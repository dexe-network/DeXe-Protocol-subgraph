import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DivestInBasicPool } from "../../../generated/schema";
import { getDivestHistoryInBasicPool } from "./history/DivestHistoryInBasicPool";
import { getInvestorBasicPool } from "./InvestorBasicPool";

export function getDivestInBasicPool(
  hash: Bytes,
  investor: Address = Address.zero(),
  volumeBase: BigInt = BigInt.fromI32(0),
  commission: BigInt = BigInt.fromI32(0)
): DivestInBasicPool {
  let id = hash.toHex();
  let divest = DivestInBasicPool.load(id);

  if (divest == null) {
    divest = new DivestInBasicPool(id);

    divest.investor = getInvestorBasicPool(investor).id;
    divest.volumeBase = volumeBase;
    divest.commission = commission;
    divest.day = "";
  }

  return divest;
}
