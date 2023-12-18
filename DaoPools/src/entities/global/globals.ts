import { BigInt } from "@graphprotocol/graph-ts";

export const PRICE_FEED_ADDRESS = "0xc2E2ad8Bbf700C054951DD869750803B15d27A9F";
export const BNB_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const WBNB_ADDRESS = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
export const DAY = 86400;
export const YEAR = BigInt.fromI32(DAY).times(BigInt.fromI32(365));
export const PERCENTAGE_NUMERATOR = 10000;
