import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InsuranceStake } from "../../../generated/schema";

export function getInsuranceStake(hash: Bytes, amount: BigInt): InsuranceStake {
  let insuranceStake = InsuranceStake.load(hash);

  if (insuranceStake == null) {
    insuranceStake = new InsuranceStake(hash);

    insuranceStake.amount = amount;
  }

  return insuranceStake;
}
