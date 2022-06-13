import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investor, InvestorPositionOffset, TraderPool } from "../../../generated/schema";

export function getPositionOffset(pool: TraderPool, investor: Investor): InvestorPositionOffset {
  let id = pool.id + investor.id;
  let positionOffset = InvestorPositionOffset.load(id);

  if (positionOffset == null) {
    positionOffset = new InvestorPositionOffset(id);

    positionOffset.offset = BigInt.zero();
  }

  return positionOffset;
}
