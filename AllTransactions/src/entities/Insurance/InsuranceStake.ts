import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InsuranceStake } from "../../../generated/schema";

export function getInsuranceStake(hash: Bytes, amount: BigInt): InsuranceStake {
  let stake = InsuranceStake.load(hash.toHexString());

  if (stake == null) {
    stake = new InsuranceStake(hash.toHexString());

    stake.amount = amount;

    stake.transaction = "";
  }

  return stake;
}
