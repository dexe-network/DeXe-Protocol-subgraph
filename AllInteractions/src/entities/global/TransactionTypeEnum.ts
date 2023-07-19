import { BigInt } from "@graphprotocol/graph-ts";

export enum TransactionType {
  SWAP = 1,
  INVEST = 2,
  DIVEST = 3,

  POOL_CREATE = 4,
  POOL_EDIT = 5,
  POOL_UPDATE_MANAGERS = 6,
  POOL_UPDATE_INVESTORS = 7,

  UPDATED_USER_CREDENTIALS = 8,

  RISKY_PROPOSAL_CREATE = 9,
  RISKY_PROPOSAL_EDIT = 10,
  RISKY_PROPOSAL_INVEST = 11,
  RISKY_PROPOSAL_DIVEST = 12,
  RISKY_PROPOSAL_SWAP = 13,

  INVEST_PROPOSAL_CREATE = 14,
  INVEST_PROPOSAL_EDIT = 15,
  INVEST_PROPOSAL_INVEST = 16,
  INVEST_PROPOSAL_WITHDRAW = 17,
  INVEST_PROPOSAL_SUPPLY = 18,
  INVEST_PROPOSAL_CLAIM = 19,

  INSURANCE_STAKE = 20,
  INSURANCE_UNSTAKE = 21,

  INSURANCE_REGISTER_PROPOSAL_CLAIM = 22,

  TRADER_GET_PERFOMANCE_FEE = 23,
  USER_AGREED_TO_PRIVACY_POLICY = 24,

  INVEST_PROPOSAL_CONVERT_TO_DIVIDENDS = 25,

  DAO_POOL_CREATED = 26,
  DAO_POOL_PROPOSAL_CREATED = 27,
  DAO_POOL_PROPOSAL_VOTED = 28,
  DAO_POOL_PROPOSAL_EXECUTED = 29,

  DAO_POOL_DELEGATED = 30,
  DAO_POOL_UNDELEGATED = 31,
  DAO_POOL_REQUESTED = 32,
  DAO_POOL_REWARD_CLAIMED = 33,
  DAO_POOL_DEPOSITED = 34,
  DAO_POOL_WITHDRAWN = 35,
  DAO_POOL_MOVED_TO_VALIDATORS = 36,
  DAO_POOL_OFFCHAIN_RESULTS_SAVED = 37,

  DAO_VALIDATORS_VOTED = 38,
  DAO_VALIDATORS_PROPOSAL_CREATED = 39,
  DAO_VALIDATORS_PROPOSAL_EXECUTED = 40,
}

export function getEnumBigInt(operation: TransactionType): BigInt {
  return BigInt.fromI32(operation as i32);
}
