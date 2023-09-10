import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { UserKeeper } from "../../generated/templates/UserKeeper/UserKeeper";

export function getNftsVotePower(userKeeper: Address, nftIds: BigInt[]): BigInt {
  let pfPrototype = UserKeeper.bind(userKeeper);

  let resp = pfPrototype.try_nftVotingPower(nftIds, false);
  if (resp.reverted) {
    log.warning("try_nftVotingPower reverted. UserKeeper: {}, nftIds: {}", [
      userKeeper.toHexString(),
      nftIds.toString(),
    ]);
    return BigInt.zero();
  } else {
    if (resp.value.value0.length == 0) {
      log.warning("try_nftVotingPower returned 0 voting power. UserKeeper: {}, nftIds: {}", [
        userKeeper.toHexString(),
        nftIds.toString(),
      ]);
    }

    return resp.value.value0;
  }
}
