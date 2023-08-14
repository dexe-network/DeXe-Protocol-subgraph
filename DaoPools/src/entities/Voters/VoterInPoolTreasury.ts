import { BigInt } from "@graphprotocol/graph-ts";
import { VoterInPool, VoterInPoolTreasury } from "../../../generated/schema";

export function getVoterInPoolTreasury(to: VoterInPool): VoterInPoolTreasury {
  let treasury = VoterInPoolTreasury.load(to.id);

  if (treasury == null) {
    treasury = new VoterInPoolTreasury(to.id);

    treasury.voter = to.id;

    treasury.delegateTreasuryAmount = BigInt.zero();
    treasury.delegateTreasuryNfts = new Array<BigInt>();
  }

  return treasury;
}
