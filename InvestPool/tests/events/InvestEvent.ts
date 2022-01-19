import { newMockEvent } from "matchstick-as/assembly/defaults";
import { Invest } from "../../generated/templates/InvestPool/InvestPool";
import {} from "@graphprotocol/graph-ts/chain/ethereum";
import { BigInt } from "@graphprotocol/graph-ts/common/numbers";
import {} from "@graphprotocol/graph-ts/common/numbers";
import { ethereum } from "@graphprotocol/graph-ts/chain/ethereum";
import { castEvent } from "../helpers/TypeCaster";

export function createNewInvestEvent(investor: string, amount: BigInt, pool: string): Invest {
  let mockEvent = newMockEvent();

  let newEvent = new Invest(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  newEvent.parameters = new Array();
  newEvent.parameters.push(new ethereum.EventParam("investor", ethereum.Value.fromString(investor)));
  newEvent.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount)));
  newEvent.parameters.push(new ethereum.EventParam("pool", ethereum.Value.fromString(pool)));

  return newEvent;
}
