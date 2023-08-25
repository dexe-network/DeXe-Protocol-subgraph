import { pushUnique } from "@solarity/graph-lib";
import { Transfer, TagsAdded } from "../../generated/templates/ERC721Expert/ERC721Expert";
import { Address, Bytes, store } from "@graphprotocol/graph-ts";
import { getExpertNftContract } from "../entities/ExpertNftContract";
import { getVoter } from "../entities/Voters/Voter";
import { getExpertNft } from "../entities/ExpertNft";

export function onTransfer(event: Transfer): void {
  const expertNftContract = getExpertNftContract(event.address);
  const voter = getVoter(event.params.to);
  const expertNft = getExpertNft(event.address, event.params.tokenId);

  if (event.params.from.equals(Address.zero())) {
    voter.expertNft = expertNft.id;

    expertNft.save();
  } else {
    voter.expertNft = Bytes.empty();

    store.remove("ExpertNft", expertNft.id.toHexString());
  }

  voter.save();
  expertNftContract.save();
}

export function onTagsAdded(event: TagsAdded): void {
  const expertNft = getExpertNft(event.address, event.params.tokenId);

  expertNft.tags = pushUnique<string>(expertNft.tags, event.params.tags);

  expertNft.save();
}
