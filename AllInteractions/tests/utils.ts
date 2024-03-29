import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { assert } from "matchstick-as";

export function getBlock(number: BigInt, timestamp: BigInt): ethereum.Block {
  return new ethereum.Block(
    Bytes.empty(),
    Bytes.empty(),
    Bytes.empty(),
    Address.zero(),
    Bytes.empty(),
    Bytes.empty(),
    Bytes.empty(),
    number,
    BigInt.zero(),
    BigInt.zero(),
    timestamp,
    BigInt.zero(),
    BigInt.zero(),
    BigInt.zero(),
    BigInt.zero()
  );
}

export function getTransaction(hash: Bytes): ethereum.Transaction {
  return new ethereum.Transaction(
    hash,
    BigInt.zero(),
    Address.zero(),
    Address.zero(),
    BigInt.zero(),
    BigInt.zero(),
    BigInt.zero(),
    Bytes.empty(),
    BigInt.zero()
  );
}

export function getNextBlock(prevBlock: ethereum.Block): ethereum.Block {
  return new ethereum.Block(
    nextHash(prevBlock.hash),
    prevBlock.hash,
    prevBlock.unclesHash,
    prevBlock.author,
    prevBlock.stateRoot,
    prevBlock.transactionsRoot,
    prevBlock.receiptsRoot,
    prevBlock.number.plus(BigInt.fromI32(1)),
    prevBlock.gasUsed,
    prevBlock.gasLimit,
    prevBlock.timestamp.plus(BigInt.fromI32(1)),
    prevBlock.difficulty,
    prevBlock.totalDifficulty,
    prevBlock.size,
    prevBlock.baseFeePerGas
  );
}

export function getNextTx(prevTx: ethereum.Transaction): ethereum.Transaction {
  return new ethereum.Transaction(
    nextHash(prevTx.hash),
    prevTx.index,
    prevTx.from,
    prevTx.to,
    prevTx.value,
    prevTx.gasLimit,
    prevTx.gasPrice,
    prevTx.input,
    prevTx.nonce.plus(BigInt.fromI32(1))
  );
}

function nextHash(prevHash: Bytes): Bytes {
  return Bytes.fromByteArray(Bytes.fromU64(prevHash.toU64() + 1));
}

export function assertTransaction(
  hash: Bytes,
  sender: Address,
  block: ethereum.Block,
  transactionType: string,
  interactionsCount: BigInt,
  pool: Bytes
): void {
  assert.fieldEquals("Transaction", hash.toHexString(), "block", block.number.toString());
  assert.fieldEquals("Transaction", hash.toHexString(), "timestamp", block.timestamp.toString());
  assert.fieldEquals("Transaction", hash.toHexString(), "type", transactionType);
  assert.fieldEquals("Transaction", hash.toHexString(), "user", sender.toHexString());
  assert.fieldEquals("Transaction", hash.toHexString(), "interactionsCount", interactionsCount.toString());
  assert.fieldEquals("Transaction", hash.toHexString(), "interactedWithPool", pool.toHexString());
}
