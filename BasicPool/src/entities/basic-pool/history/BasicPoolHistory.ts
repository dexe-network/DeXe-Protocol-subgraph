import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { BasicPoolHistory } from "../../../../generated/schema";
import { extendArray } from "../../../helpers/ArrayHelper";
import { DAY } from "../../global/globals";

export function getBasicPoolHistory(timestamp: BigInt, pool: string, investors: Array<Bytes>): BasicPoolHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = pool + day.toString();
  let history = BasicPoolHistory.load(id);
  if (history == null) {
    history = new BasicPoolHistory(id);
    history.pool = pool;
    history.investors = new Array<Bytes>();
    history.day = day;

    history.investors = extendArray(history.investors, investors);
  }
  return history;
}
