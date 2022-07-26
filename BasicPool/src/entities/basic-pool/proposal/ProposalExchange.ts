import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ProposalExchange } from "../../../../generated/schema";
import { increaseCounter } from "../../../helpers/IncreaseCounter";
import { getInteractionCount } from "../../global/InteractionCount";

export function getProposalExchange(
  hash: Bytes,
  fromToken: Address = Address.zero(),
  toToken: Address = Address.zero(),
  fromVolume: BigInt = BigInt.zero(),
  toVolume: BigInt = BigInt.zero(),
  usdVolume: BigInt = BigInt.zero(),
  timestamp: BigInt = BigInt.zero()
): ProposalExchange {
  let counter = getInteractionCount(hash);
  let id = hash.concatI32(counter.count.toI32());
  let exchange = ProposalExchange.load(id);

  if (exchange == null) {
    exchange = new ProposalExchange(id);

    exchange.fromToken = fromToken;
    exchange.hash = hash;
    exchange.toToken = toToken;
    exchange.fromVolume = fromVolume;
    exchange.toVolume = toVolume;
    exchange.usdVolume = usdVolume;
    exchange.day = "";
    exchange.timestamp = timestamp;

    increaseCounter(counter);
  }

  return exchange;
}
