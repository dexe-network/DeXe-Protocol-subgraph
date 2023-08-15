import { pushUnique, remove } from "@solarity/graph-lib";
import { Transfer, TagsAdded } from "../../generated/templates/ERC721Expert/ERC721Expert";
import { getExpertNft } from "../entities/ExpertNft/ExpertNft";
import { Address, Bytes, store } from "@graphprotocol/graph-ts";
import { getExpert } from "../entities/ExpertNft/Expert";
import { getExpertInPool } from "../entities/ExpertNft/ExpertInPool";
import { getExpertNftContract } from "../entities/ExpertNftContract";

export function onTransfer(event: Transfer): void {
  let expertNftContract = getExpertNftContract(event.address);

  if (event.params.from.equals(Address.zero())) {
    const expert = getExpert(event.params.to);
    const expertInPool = getExpertInPool(expert, expertNftContract.daoPool, event.params.tokenId);
    getExpertNft(event.address, event.params.tokenId, event.params.to).save();

    expert.pools = pushUnique<Bytes>(expert.pools, [expertNftContract.daoPool]);

    expertInPool.save();
    expert.save();
  } else {
    const expert = getExpert(event.params.from);

    expert.pools = remove<Bytes>(expert.pools, [expertNftContract.daoPool]);

    store.remove("ExpertInPool", event.params.from.concat(expertNftContract.daoPool).toHexString());
    store.remove(
      "ExpertNft",
      event.address.concat(Bytes.fromByteArray(Bytes.fromBigInt(event.params.tokenId))).toHexString()
    );

    if (expert.pools.length == 0) {
      store.remove("Expert", expert.id.toHexString());
    } else {
      expert.save();
    }
  }

  expertNftContract.save();
}

export function onTagsAdded(event: TagsAdded): void {
  const expertNft = getExpertNft(event.address, event.params.tokenId);

  expertNft.tags = pushUnique<string>(expertNft.tags, event.params.tags);

  expertNft.save();
}
