import { ethereum as eth, Bytes as Bytes_new } from "@graphprotocol/graph-ts/";
import { ethereum, Address, BigInt, Bytes } from "matchstick-as/node_modules/@graphprotocol/graph-ts";
import { Address as addr, BigInt as BI } from "@graphprotocol/graph-ts/common/numbers";
import { ethereum as e } from "@graphprotocol/graph-ts/chain/ethereum";

export function castEvent(old_event: ethereum.Event): eth.Event {
  return new eth.Event(
    castAddress(old_event.address),
    castBigInt(old_event.logIndex),
    castBigInt(old_event.transactionLogIndex),
    old_event.logType,
    castBlock(old_event.block),
    castTransaction(old_event.transaction),
    castEventParamArray(old_event.parameters)
  );
}

export function castEventParam(old_param: ethereum.EventParam): eth.EventParam {
  return new eth.EventParam(old_param.name, castValue(old_param.value));
}

export function castValue(old_value: ethereum.Value): eth.Value {
  return new eth.Value(old_value.kind, old_value.data);
}

export function castEventParamArray(old_array: ethereum.EventParam[]): eth.EventParam[] {
  let new_array = [];

  for (let i = 0; i < old_array.length; i++) {
    new_array[i] = castEventParam(old_array[i]);
  }

  return new_array;
}

export function castAddress(address: Address): addr {
  return addr.fromString(address.toString());
}

export function castBigInt(number: BigInt): BI {
  return BI.fromString(number.toString());
}

export function castBytes(bytes: Bytes): Bytes_new {
  return Bytes_new.fromHexString(bytes.toString());
}

export function castBlock(block: ethereum.Block): eth.Block {
  return new eth.Block(
    castBytes(block.hash),
    castBytes(block.parentHash),
    castBytes(block.unclesHash),
    castAddress(block.author),
    castBytes(block.stateRoot),
    castBytes(block.transactionsRoot),
    castBytes(block.receiptsRoot),
    castBigInt(block.number),
    castBigInt(block.gasUsed),
    castBigInt(block.gasLimit),
    castBigInt(block.timestamp),
    castBigInt(block.difficulty),
    castBigInt(block.totalDifficulty),
    castBigInt(block.size != null ? block.size : BigInt.fromI32(0))
  );
}

export function castTransaction(tx: ethereum.Transaction): eth.Transaction {
  return new eth.Transaction(
    castBytes(tx.hash),
    castBigInt(tx.index),
    castAddress(tx.from),
    castAddress(tx.to != null ? tx.to : Address.zero()),
    castBigInt(tx.value),
    castBigInt(tx.gasLimit),
    castBigInt(tx.gasPrice),
    castBytes(tx.input)
  );
}

export function castTuple(tuple: ethereum.Tuple): eth.Tuple {
  let new_tuple = new eth.Tuple(tuple.length);

  for (let i = 0; i < tuple.length; i++) {
    new_tuple[i] = castValue(tuple[i]);
  }

  return new_tuple;
}
