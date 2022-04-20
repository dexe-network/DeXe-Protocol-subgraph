import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { InvestPoolHistory } from "../../../../generated/schema";
import { extendArray } from "../../../helpers/ArrayHelper";
import { DAY } from "../../global/globals";

export function getInvestPoolHistory(timestamp: BigInt, pool: string, investors: Array<Bytes>): InvestPoolHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = pool + day.toString();
  let history = InvestPoolHistory.load(id);
  if (history == null) {
    history = new InvestPoolHistory(id);
    history.pool = pool;
    history.investors = new Array<Bytes>();
    history.day = day;

    history.investors = extendArray(history.investors, investors);
  }
  return history;
}
