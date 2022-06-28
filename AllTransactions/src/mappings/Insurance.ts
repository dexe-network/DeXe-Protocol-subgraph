import { Deposited, Paidout, Withdrawn } from "../../generated/Insurance/Insurance";

export function onDeposit(event: Deposited): void {
  event.params.investor;
  event.params.amount;
}

export function onWithdraw(event: Withdrawn): void {
  event.params.investor;
  event.params.amount;
}

export function onPayout(event: Paidout): void {
  event.params.investor;
  event.params.userStakePayout;
  event.params.insurancePayout;
}
