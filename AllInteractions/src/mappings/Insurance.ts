import { BigInt } from "@graphprotocol/graph-ts";
import { pushUnique } from "@solarity/graph-lib";
import { Deposited, Paidout, Withdrawn } from "../../generated/Insurance/Insurance";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getInsuranceStake } from "../entities/insurance/InsuranceStake";
import { getTransaction } from "../entities/transaction/Transaction";
import { push } from "../helpers/ArrayHelper";

export function onDeposit(event: Deposited): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.investor
  );
  let stake = getInsuranceStake(event.transaction.hash, event.params.amount, transaction.interactionsCount);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = pushUnique<BigInt>(transaction.type, [getEnumBigInt(TransactionType.INSURANCE_STAKE)]);
  stake.transaction = transaction.id;

  transaction.save();
  stake.save();
}

export function onWithdraw(event: Withdrawn): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.investor
  );
  let stake = getInsuranceStake(event.transaction.hash, event.params.amount, transaction.interactionsCount);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.INSURANCE_UNSTAKE));
  stake.transaction = transaction.id;

  transaction.save();
  stake.save();
}
