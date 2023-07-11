import { BigInt } from "@graphprotocol/graph-ts";
import { pushUnique } from "@dlsl/graph-modules";
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

  transaction.type = pushUnique<BigInt>(transaction.type, [
    getEnumBigInt(TransactionType.USER_AGREED_TO_PRIVACY_POLICY),
  ]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  transaction.save();
}

export function onUpdatedProfile(event: UpdatedProfile): void {
  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.user
  );

  transaction.type = pushUnique<BigInt>(transaction.type, [getEnumBigInt(TransactionType.UPDATED_USER_CREDENTIALS)]);
  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));

  transaction.save();
}
