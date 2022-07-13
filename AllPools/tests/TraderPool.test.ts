import { Address, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import {
  DescriptionURLChanged,
  InvestorAdded,
  InvestorRemoved,
  ModifiedAdmins,
  ModifiedPrivateInvestors,
} from "../generated/templates/TraderPool/TraderPool";

function createInvestorAdded(
  investor: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): InvestorAdded {
  let event = changetype<InvestorAdded>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("investor", ethereum.Value.fromAddress(investor)));

  event.address = sender;
  event.block = block;
  event.transaction = tx;

  return event;
}

function createInvestorRemoved(
  investor: Address,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): InvestorRemoved {
  let event = changetype<InvestorRemoved>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("investor", ethereum.Value.fromAddress(investor)));

  event.address = sender;
  event.block = block;
  event.transaction = tx;

  return event;
}

function createDescriptionURLChanged(
  user: Address,
  descriptionURL: string,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): DescriptionURLChanged {
  let event = changetype<InvestorRemoved>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("descriptionURL", ethereum.Value.fromString(descriptionURL)));

  event.address = sender;
  event.block = block;
  event.transaction = tx;

  return event;
}

function createModifiedAdmins(
  user: Address,
  admins: Address[],
  add: boolean,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ModifiedAdmins {
  let event = changetype<InvestorRemoved>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("admins", ethereum.Value.fromAddressArray(admins)));
  event.parameters.push(new ethereum.EventParam("add", ethereum.Value.fromBoolean(add)));

  event.address = sender;
  event.block = block;
  event.transaction = tx;

  return event;
}

function createModifiedPrivateInvestors(
  user: Address,
  privateInvestors: Address[],
  add: boolean,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ModifiedPrivateInvestors {
  let event = changetype<InvestorRemoved>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(user)));
  event.parameters.push(new ethereum.EventParam("privateInvestors", ethereum.Value.fromAddressArray(privateInvestors)));
  event.parameters.push(new ethereum.EventParam("add", ethereum.Value.fromBoolean(add)));

  event.address = sender;
  event.block = block;
  event.transaction = tx;

  return event;
}
