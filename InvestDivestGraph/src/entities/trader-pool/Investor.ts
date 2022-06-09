import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investor } from "../../../generated/schema";

export function getInvestor(id: Address): Investor {
  let investor = Investor.load(id.toHexString());

  if (investor == null) {
    investor = new Investor(id.toHexString());
  }

  return investor;
}
