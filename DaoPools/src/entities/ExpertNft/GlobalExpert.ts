import { Address, Bytes } from "@graphprotocol/graph-ts";
import { GlobalExpert } from "../../../generated/schema";

export function getGlobalExpert(expertAddress: Address, nft: Bytes = Bytes.empty()): GlobalExpert {
  let expert = GlobalExpert.load(expertAddress);

  if (expert == null) {
    expert = new GlobalExpert(expertAddress);
    expert.nft = nft;
  }

  return expert;
}
