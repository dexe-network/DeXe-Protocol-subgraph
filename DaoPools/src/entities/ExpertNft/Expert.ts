import { Address, Bytes } from "@graphprotocol/graph-ts";
import { Expert } from "../../../generated/schema";

export function getExpert(expertAddress: Address): Expert {
  let expert = Expert.load(expertAddress);

  if (expert == null) {
    expert = new Expert(expertAddress);
    expert.pools = new Array<Bytes>();
  }

  return expert;
}
