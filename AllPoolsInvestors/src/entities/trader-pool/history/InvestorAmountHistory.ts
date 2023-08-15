import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DAY, MAX_SEARCH_DEPTH } from "../../global/globals";
import { Investor, InvestorAmountHistory } from "../../../../generated/schema";
import { findPrevHistory } from "@solarity/graph-lib";

export function getInvestorAmountHistory(investor: Investor, timestamp: BigInt): InvestorAmountHistory {
  let day = timestamp.div(BigInt.fromI32(DAY));
  let id = investor.id.toHexString() + day.toString();
  let history = InvestorAmountHistory.load(id);

  if (history == null) {
    history = new InvestorAmountHistory(id);

    history.totalUSDInvestVolume = BigInt.zero();
    history.totalUSDDivestVolume = BigInt.zero();
    history.totalNativeInvestVolume = BigInt.zero();
    history.totalNativeDivestVolume = BigInt.zero();
    history.totalBTCInvestVolume = BigInt.zero();
    history.totalBTCDivestVolume = BigInt.zero();

    history.investor = investor.id;
    history.prevHistory = "";
    history.day = day;
  }

  return history;
}

export function injectPrevInvestorAmountHistory(history: InvestorAmountHistory, investor: Investor): void {
  if (history.prevHistory == "") {
    let prevHistory = findPrevHistory<InvestorAmountHistory>(
      InvestorAmountHistory.load,
      investor.id.toHexString(),
      history.day,
      BigInt.fromI32(MAX_SEARCH_DEPTH),
      1
    );
    if (prevHistory != null) {
      history.prevHistory = prevHistory.id;

      history.totalUSDInvestVolume = prevHistory.totalUSDInvestVolume;
      history.totalUSDDivestVolume = prevHistory.totalUSDDivestVolume;
      history.totalNativeInvestVolume = prevHistory.totalNativeInvestVolume;
      history.totalNativeDivestVolume = prevHistory.totalNativeDivestVolume;
      history.totalBTCInvestVolume = prevHistory.totalBTCInvestVolume;
      history.totalBTCDivestVolume = prevHistory.totalBTCDivestVolume;
    }
  }
}
