import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BasicPoolHistory } from "../../../../generated/schema";
import { DAY } from "../../global/globals";
import { getBasicTraderPool } from "../BasicTraderPool";

export function getBasicPoolHistory(timestamp: BigInt, pool: string, investors: Array<string>): BasicPoolHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = pool.toString() + day.toString();
  let history = BasicPoolHistory.load(id);
  if (history == null) {
    history = new BasicPoolHistory(id);
    history.pool = pool;
    history.investors = new Array<string>();
    history.day = day;

    for (let i = 0; i < investors.length; i++) {
      history.investors.push(investors[i]);
    }
  }
  return history;
}
