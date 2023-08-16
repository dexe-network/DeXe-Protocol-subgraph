import { BigInt } from "@graphprotocol/graph-ts";
import { DaoPoolDeployed } from "../../generated/PoolFactory/PoolFactory";
import { DaoPool, DaoValidators } from "../../generated/templates";
import { getDaoPoolCreate } from "../entities/dao-pool/DaoPoolCreate";
import { getEnumBigInt, TransactionType } from "../entities/global/TransactionTypeEnum";
import { getTransaction } from "../entities/transaction/Transaction";
import { push } from "../helpers/ArrayHelper";

export function onDaoPoolDeployed(event: DaoPoolDeployed): void {
  DaoPool.create(event.params.govPool);
  DaoValidators.create(event.params.validators);

  let transaction = getTransaction(
    event.transaction.hash,
    event.block.number,
    event.block.timestamp,
    event.params.sender,
    event.params.govPool
  );

  let daoCreate = getDaoPoolCreate(
    event.transaction.hash,
    event.params.govPool,
    event.params.name,
    transaction.interactionsCount
  );

  transaction.interactionsCount = transaction.interactionsCount.plus(BigInt.fromI32(1));
  transaction.type = push<BigInt>(transaction.type, getEnumBigInt(TransactionType.DAO_POOL_CREATED));
  daoCreate.transaction = transaction.id;

  transaction.save();
  daoCreate.save();
}
