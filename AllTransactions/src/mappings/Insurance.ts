import { Deposited, Paidout, ProposedClaim, Withdrawn } from "../../generated/Insurance/Insurance";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getInsuranceStake } from "../entities/insurance/InsuranceStake";
import { getTransaction } from "../entities/transaction/Transaction";

export function onDeposit(event: Deposited): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.investor
  );
  let stake = getInsuranceStake(event.transaction.hash, event.params.amount);

  transaction.insuranceStake = stake.id;
  transaction.type = getEnumBigInt(TransactionType.INSURANCE_STAKE);
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
  let stake = getInsuranceStake(event.transaction.hash, event.params.amount);

  transaction.insuranceStake = stake.id;
  transaction.type = getEnumBigInt(TransactionType.INSURANCE_UNSTAKE);
  stake.transaction = transaction.id;

  transaction.save();
  stake.save();
}

export function onProposedClaim(event: ProposedClaim): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender
  );

  transaction.type = getEnumBigInt(TransactionType.INSURANCE_UNSTAKE);

  transaction.save();
}
