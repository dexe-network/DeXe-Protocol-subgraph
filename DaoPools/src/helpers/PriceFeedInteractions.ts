import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { PriceFeed } from "../../generated/templates/DaoPool/PriceFeed";
import { PRICE_FEED_ADDRESS } from "../entities/global/globals";

export function getUSDValue(token: Bytes, amount: BigInt): BigInt {
  if (token.equals(Bytes.empty())) {
    return BigInt.zero();
  }
  
  let pfPrototype = PriceFeed.bind(Address.fromString(PRICE_FEED_ADDRESS));

  let resp = pfPrototype.try_getNormalizedPriceOutUSD(Address.fromBytes(token), amount);
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
