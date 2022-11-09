import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolCreate } from "../../../generated/schema";

export function getDaoPoolCreated(hash: Bytes, pool: Address, name: string, count: BigInt): DaoPoolCreate {
  let id = hash.concatI32(count.toI32());
  let daoPoolCreate = DaoPoolCreate.load(id);

  if (daoPoolCreate == null) {
    daoPoolCreate = new DaoPoolCreate(id);
    daoPoolCreate.pool = pool;
    daoPoolCreate.name = name;

    daoPoolCreate.transaction = Bytes.empty();
  }

  return daoPoolCreate;
}
