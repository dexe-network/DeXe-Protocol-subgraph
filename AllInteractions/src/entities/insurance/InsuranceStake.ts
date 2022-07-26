import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InsuranceStake } from "../../../generated/schema";

export function getInsuranceStake(hash: Bytes, amount: BigInt, count: BigInt): InsuranceStake {
  let id = hash.concatI32(count.toI32());
  let insuranceStake = InsuranceStake.load(id);

  if (insuranceStake == null) {
    insuranceStake = new InsuranceStake(id);

    insuranceStake.amount = amount;
  }

  return insuranceStake;
}
