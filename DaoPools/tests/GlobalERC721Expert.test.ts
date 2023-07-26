import { Address, ethereum, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, beforeAll, afterEach, describe, newMockEvent, test } from "matchstick-as";
import { TagsAdded, Transfer } from "../generated/templates/ERC721Expert/ERC721Expert";
import { getBlock, getTransaction } from "./utils";
import { onTagsAdded, onTransfer } from "../src/mappings/GlobalERC721Expert";

function createTransfer(
  from: Address,
  to: Address,
  tokenId: BigInt,
  contractSender: Bytes,
  block: ethereum.Block,
  tx: ethereum.Transaction
): Transfer {
  let event = changetype<Transfer>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(from)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(tokenId)));

  event.block = block;
  event.transaction = tx;
  event.address = Address.fromBytes(contractSender);

  return event;
}

function createTagsAdded(
  tokenId: BigInt,
  tags: Array<string>,
  contractSender: Bytes,
  block: ethereum.Block,
  tx: ethereum.Transaction
): TagsAdded {
  let event = changetype<TagsAdded>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromUnsignedBigInt(tokenId)));
  event.parameters.push(new ethereum.EventParam("tags", ethereum.Value.fromStringArray(tags)));

  event.block = block;
  event.transaction = tx;
  event.address = Address.fromBytes(contractSender);

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));

const nft = Address.fromString("0x328f2a5cd77856aD326635485192D959ECcE1A70");

describe("GlobalERC721Expert", () => {
  test("should handle Transfer (mint)", () => {
    const from = Address.zero();
    const to = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181671");

    let tokenId = BigInt.fromI32(1);

    let event = createTransfer(from, to, tokenId, nft, block, tx);

    onTransfer(event);

    assert.fieldEquals("GlobalExpert", to.toHexString(), "id", to.toHexString());
    assert.fieldEquals(
      "GlobalExpert",
      to.toHexString(),
      "nft",
      event.address.concat(bytesFromBigInt(tokenId)).toHexString()
    );

    assert.fieldEquals(
      "ExpertNft",
      nft.concat(bytesFromBigInt(tokenId)).toHexString(),
      "id",
      nft.concat(bytesFromBigInt(tokenId)).toHexString()
    );
    assert.fieldEquals("ExpertNft", nft.concat(bytesFromBigInt(tokenId)).toHexString(), "tokenId", tokenId.toString());
    assert.fieldEquals("ExpertNft", nft.concat(bytesFromBigInt(tokenId)).toHexString(), "tags", "[]");
    assert.fieldEquals("ExpertNft", nft.concat(bytesFromBigInt(tokenId)).toHexString(), "expert", to.toHexString());
  });

  test("should handle Transfer (burn)", () => {
    const from = Address.fromString("0x96e08f7d84603AEb97cd1c89A80A9e914f181671");
    const to = Address.zero();

    let tokenId = BigInt.fromI32(1);

    let event = createTransfer(from, to, tokenId, nft, block, tx);

    onTransfer(event);

    assert.notInStore("ExpertNft", nft.concat(bytesFromBigInt(tokenId)).toHexString());
    assert.notInStore("GlobalExpert", from.toHexString());
  });

  test("should handle TagsAdded", () => {
    let tokenId = BigInt.fromI32(1);
    let tags = ["tag1", "tag2"];

    let event = createTagsAdded(tokenId, tags, nft, block, tx);

    onTagsAdded(event);

    assert.fieldEquals(
      "ExpertNft",
      nft.concat(bytesFromBigInt(tokenId)).toHexString(),
      "id",
      nft.concat(bytesFromBigInt(tokenId)).toHexString()
    );
    assert.fieldEquals("ExpertNft", nft.concat(bytesFromBigInt(tokenId)).toHexString(), "tokenId", tokenId.toString());
    assert.fieldEquals("ExpertNft", nft.concat(bytesFromBigInt(tokenId)).toHexString(), "tags", "[tag1, tag2]");

    tags = ["tag3"];

    event = createTagsAdded(tokenId, tags, nft, block, tx);

    onTagsAdded(event);

    assert.fieldEquals(
      "ExpertNft",
      nft.concat(bytesFromBigInt(tokenId)).toHexString(),
      "id",
      nft.concat(bytesFromBigInt(tokenId)).toHexString()
    );
    assert.fieldEquals("ExpertNft", nft.concat(bytesFromBigInt(tokenId)).toHexString(), "tokenId", tokenId.toString());
    assert.fieldEquals("ExpertNft", nft.concat(bytesFromBigInt(tokenId)).toHexString(), "tags", "[tag1, tag2, tag3]");
  });
});

function bytesFromBigInt(v: BigInt): Bytes {
  return Bytes.fromByteArray(Bytes.fromBigInt(v));
}
