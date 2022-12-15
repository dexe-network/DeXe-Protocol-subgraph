import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { PriceFeed } from "../../generated/templates/InvestProposal/PriceFeed";
import { PRICE_FEED_ADDRESS } from "../entities/global/globals";

export function getUSDValue(token: Bytes, amount: BigInt): BigInt {
  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));

  let resp = pfPrototype.try_getNormalizedPriceOutUSD(Address.fromString(token.toHexString()), amount);
  if (resp.reverted) {
    log.warning("try_getNormalizedPriceOutUSD reverted. FromToken: {}, Amount:{}", [
      token.toHexString(),
      amount.toString(),
    ]);
    return BigInt.zero();
  } else {
    if (resp.value.value1.length == 0) {
      log.warning("try_getNormalizedPriceOutUSD returned 0 length path. FromToken: {}, Amount:{}", [
        token.toHexString(),
        amount.toString(),
      ]);
    }
    return resp.value.value0;
  }
}

export function getTokenValue(fromToken: Bytes, toToken: Bytes, amount: BigInt): BigInt {
  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));

  let resp = pfPrototype.try_getNormalizedPriceOut(Address.fromBytes(fromToken), Address.fromBytes(toToken), amount);
  if (resp.reverted) {
    log.warning("try_getNormalizedPriceOut reverted. FromToken: {}, ToToken: {}, Amount:{}", [
      fromToken.toHexString(),
      toToken.toHexString(),
      amount.toString(),
    ]);
    return BigInt.zero();
  } else {
    if (resp.value.value1.length == 0) {
      log.warning("try_getNormalizedPriceOut returned 0 length path. FromToken: {}, ToToken: {}, Amount:{}", [
        fromToken.toHexString(),
        toToken.toHexString(),
        amount.toString(),
      ]);
    }
    return resp.value.value0;
  }
}
