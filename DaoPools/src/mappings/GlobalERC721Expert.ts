import { pushUnique } from "@dlsl/graph-modules";
import { Transfer, TagsAdded } from "../../generated/templates/ERC721Expert/ERC721Expert";
import { getExpertNft } from "../entities/ExpertNft/ExpertNft";
import { Address, Bytes, store } from "@graphprotocol/graph-ts";
import { getGlobalExpert } from "../entities/ExpertNft/GlobalExpert";

export function onTransfer(event: Transfer): void {
  if (event.params.from.equals(Address.zero())) {
    const nft = getExpertNft(event.address, event.params.tokenId, event.params.to);

    getGlobalExpert(event.params.to, nft.id).save();

    nft.save();
  } else {
    store.remove(
      "ExpertNft",
      event.address.concat(Bytes.fromByteArray(Bytes.fromBigInt(event.params.tokenId))).toHexString()
    );
    store.remove("GlobalExpert", event.params.from.toHexString());
  }
}

export function onTagsAdded(event: TagsAdded): void {
  const expertNft = getExpertNft(event.address, event.params.tokenId);

  expertNft.tags = pushUnique<string>(expertNft.tags, event.params.tags);

  expertNft.save();
}
