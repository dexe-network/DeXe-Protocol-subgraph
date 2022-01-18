import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalSupply } from "../../../../generated/schema";

export function getProposalSupply(
  hash: Bytes,
  amount: BigInt = BigInt.zero(),
  InvestorInfoId: string = ""
): ProposalSupply {
  let id = hash.toHex();
  let supply = ProposalSupply.load(id);

  if (supply == null) {
    supply = new ProposalSupply(id);
    supply.investor = InvestorInfoId;
    supply.amount = amount;
    supply.day = "";
  }

  return supply;
}
