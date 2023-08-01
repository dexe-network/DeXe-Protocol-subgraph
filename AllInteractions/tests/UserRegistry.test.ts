import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { assert, describe, newMockEvent, test } from "matchstick-as";
import { Agreed, UpdatedProfile } from "../generated/UserRegistry/UserRegistry";
import { assertTransaction, getBlock, getNextTx, getTransaction } from "./utils";
import { onAgreed, onUpdatedProfile } from "../src/mappings/UserRegistry";
import { TransactionType } from "../src/entities/global/TransactionTypeEnum";

function createAgreedEvent(user: Address, doc: Bytes, block: ethereum.Block, tx: ethereum.Transaction): Agreed {
  let event = changetype<Agreed>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("documentHash", ethereum.Value.fromBytes(doc)));

  event.block = block;
  event.transaction = tx;

  return event;
}

function createUpdatedProfile(
  user: Address,
  url: string,
  block: ethereum.Block,
  tx: ethereum.Transaction
): UpdatedProfile {
  let event = changetype<UpdatedProfile>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("user", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("url", ethereum.Value.fromString(url)));

  event.block = block;
  event.transaction = tx;

  return event;
}

const block = getBlock(BigInt.fromI32(1), BigInt.fromI32(1));
const tx = getTransaction(Bytes.fromByteArray(Bytes.fromBigInt(BigInt.fromI32(1))));

describe("UserRegistry", () => {
  test("should handle Agreed event", () => {
    let user = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181679");
    let doc = Bytes.empty();

    let event = createAgreedEvent(user, doc, block, tx);

    onAgreed(event);

    assertTransaction(
      tx.hash,
      event.params.user,
      block,
      `[${TransactionType.USER_AGREED_TO_PRIVACY_POLICY}]`,
      BigInt.fromI32(1),
      Bytes.empty()
    );

    const nextTx = getNextTx(tx);
    user = Address.fromString("0x40007caAE6E086373ce52B3E123C5c3E7b6987fE");

    event = createAgreedEvent(user, doc, block, nextTx);

    onAgreed(event);

    assertTransaction(
      nextTx.hash,
      event.params.user,
      block,
      `[${TransactionType.USER_AGREED_TO_PRIVACY_POLICY}]`,
      BigInt.fromI32(1),
      Bytes.empty()
    );
  });

  test("should handle UpdatedProfile event", () => {
    let user = Address.fromString("0x86e08f7d84603AEb97cd1c89A80A9e914f181679");
    let url = "URL_1";

    let event = createUpdatedProfile(user, url, block, tx);

    onUpdatedProfile(event);

    assertTransaction(
      tx.hash,
      event.params.user,
      block,
      `[${TransactionType.USER_AGREED_TO_PRIVACY_POLICY}, ${TransactionType.UPDATED_USER_CREDENTIALS}]`,
      BigInt.fromI32(2),
      Bytes.empty()
    );

    const nextTx = getNextTx(tx);
    user = Address.fromString("0x40007caAE6E086373ce52B3E123C5c3E7b6987fE");
    url = "URL_2";

    event = createUpdatedProfile(user, url, block, nextTx);

    onUpdatedProfile(event);

    assertTransaction(
      nextTx.hash,
      event.params.user,
      block,
      `[${TransactionType.USER_AGREED_TO_PRIVACY_POLICY}, ${TransactionType.UPDATED_USER_CREDENTIALS}]`,
      BigInt.fromI32(2),
      Bytes.empty()
    );
  });
});
