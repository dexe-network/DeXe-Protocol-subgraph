import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import {
  ProposalCreated,
  ProposalCreatedProposalLimitsStruct,
  ProposalExchanged,
} from "../generated/templates/TraderPoolRiskyProposal/TraderPoolRiskyProposal";

function createProposalCreated(
  proposalId: BigInt,
  token: Address,
  proposalLimits: ProposalCreatedProposalLimitsStruct,
  sender: Address,
  block: ethereum.Block,
  tx: ethereum.Transaction
): ProposalCreated {
  let event = changetype<ProposalCreated>(newMockEvent());
  event.parameters = new Array();

  event.parameters.push(new ethereum.EventParam("proposalId", ethereum.Value.fromUnsignedBigInt(proposalId)));
  event.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(token)));
  event.parameters.push(new ethereum.EventParam("proposalLimits", ethereum.Value.fromTuple(proposalLimits)));

  event.block = block;
  event.transaction = tx;
  event.address = sender;

  return event;
}

function createProposalExchanged(): ProposalExchanged {}
