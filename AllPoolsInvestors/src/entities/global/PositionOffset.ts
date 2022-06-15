import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Investor, InvestorPoolPositionOffset, TraderPool } from "../../../generated/schema";

export function getPositionOffset(pool: TraderPool, investor: Investor): InvestorPoolPositionOffset {
  let id = pool.id + investor.id;
  let positionOffset = InvestorPoolPositionOffset.load(id);

  if (positionOffset == null) {
    positionOffset = new InvestorPoolPositionOffset(id);

    positionOffset.offset = BigInt.zero();
  }

  return positionOffset;
}
