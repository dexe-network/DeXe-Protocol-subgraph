import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalDivest } from "../../../../generated/schema";

export function getProposalDivest(
  hash: Bytes,
  amountLP: BigInt = BigInt.zero(),
  investorInfoId: string = "",
  timestamp: BigInt = BigInt.zero()
): ProposalDivest {
  let id = hash.toHexString();
  let divest = ProposalDivest.load(id);

  if (divest == null) {
    divest = new ProposalDivest(id);

    divest.amount = amountLP;
    divest.investor = investorInfoId;
    divest.day = "";
    divest.timestamp = timestamp;
  }

  return divest;
}
