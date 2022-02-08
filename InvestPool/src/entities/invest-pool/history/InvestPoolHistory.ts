import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InvestPoolHistory } from "../../../../generated/schema";
import { push } from "../../../helpers/ArrayHelper";
import { DAY } from "../../global/globals";
import { getInvestTraderPool } from "../InvestTraderPool";

export function getInvestPoolHistory(timestamp: BigInt, pool: string, investors: Array<string>): InvestPoolHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = pool + day.toString();
  let history = InvestPoolHistory.load(id);
  if (history == null) {
    history = new InvestPoolHistory(id);
    history.pool = pool;
    history.investors = new Array<string>();
    history.day = day;

    for (let i = 0; i < investors.length; i++) {
      history.investors = push(history.investors, investors[i]);
    }
  }
  return history;
}
