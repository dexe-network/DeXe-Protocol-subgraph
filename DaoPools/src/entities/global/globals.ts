import { BigInt } from "@graphprotocol/graph-ts";

export const PRICE_FEED_ADDRESS = "0x56d8412b75434671FbC6ad9c6b91Ba2d5E3817c1";
export const BNB_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const WBNB_ADDRESS = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
export const DAY = 86400;
export const YEAR = BigInt.fromI32(DAY).times(BigInt.fromI32(365));
export const PERCENTAGE_NUMERATOR = 10000;

export const REWARD_TYPE_CREATE = 0;
export const REWARD_TYPE_VOTE_FOR = 1;
export const REWARD_TYPE_VOTE_AGAINST = 2;
export const REWARD_TYPE_VOTE_FOR_DELEGATED = 3;
export const REWARD_TYPE_VOTE_AGAINST_DELEGATED = 4;
