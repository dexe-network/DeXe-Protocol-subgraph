import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investor } from "../../../generated/schema";

export function getInvestor(id: Address): Investor {
  let investor = Investor.load(id.toString());

  if (investor == null) {
    investor = new Investor(id.toString());
    investor.insurance = BigInt.zero();
    investor.claimedAmount = BigInt.zero();
    investor.activePools = new Array();
    investor.allPools = new Array();
  }

  return investor;
}
