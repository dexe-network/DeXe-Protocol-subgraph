import { Address, Bytes } from "@graphprotocol/graph-ts";
import { DaoPool, Executor } from "../../../generated/schema";

export function getExecutor(pool: DaoPool, executorAddress: Address): Executor {
  let id = pool.id.concat(executorAddress);
  let executor = Executor.load(id);

  if (executor == null) {
    executor = new Executor(id);

    executor.executorAddress = executorAddress;
    executor.settings = Bytes.empty();
    executor.pool = pool.id;
  }

  return executor;
}
