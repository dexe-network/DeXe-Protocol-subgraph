import { BigInt } from "@graphprotocol/graph-ts";

export const PRICE_FEED_ADDRESS = "0x4eFE132BB9FFECf8A44011E8626FAe4227aA64A0";
export const BNB_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const WBNB_ADDRESS = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
export const DAY = 86400;
export const YEAR = BigInt.fromI32(DAY).times(BigInt.fromI32(365));
export const PERCENTAGE_NUMERATOR = 10000;
