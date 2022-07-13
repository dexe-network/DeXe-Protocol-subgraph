import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investor } from "../../../generated/schema";

export function getInvestor(id: Address): Investor {
  let investor = Investor.load(id);

  if (investor == null) {
    investor = new Investor(id);
    investor.activePools = new Array();
    investor.allPools = new Array();
  }

  return investor;
}
