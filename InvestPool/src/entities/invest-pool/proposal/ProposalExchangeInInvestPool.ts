import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalExchangeInInvestPool } from "../../../../generated/schema";

export function getProposalExchangeInInvestPool(
  hash: Bytes,
  fromToken: Address = Address.zero(),
  toToken: Address = Address.zero(),
  fromVolume: BigInt = BigInt.zero(),
  toVolume: BigInt = BigInt.zero()
): ProposalExchangeInInvestPool {
  let id = hash.toHex();
  let exchange = ProposalExchangeInInvestPool.load(id);

  if (exchange == null) {
    exchange = new ProposalExchangeInInvestPool(id);

    exchange.fromToken = fromToken;
    exchange.toToken = toToken;
    exchange.fromVolume = fromVolume;
    exchange.toVolume = toVolume;
    exchange.day = "";
  }

  return exchange;
}
