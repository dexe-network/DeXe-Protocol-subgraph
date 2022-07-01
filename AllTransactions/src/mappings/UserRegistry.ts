import { Agreed, UpdatedProfile } from "../../generated/UserRegistry/UserRegistry";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getTransaction } from "../entities/transaction/Transaction";

export function onAgreed(event: Agreed): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );

  transaction.type = getEnumBigInt(TransactionType.TRADER_GET_PERFOMANCE_FEE);

  transaction.save();
}

export function onUpdatedProfile(event: UpdatedProfile): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );

  transaction.type = getEnumBigInt(TransactionType.UPDATED_USER_CREDENTIALS);

  transaction.save();
}
