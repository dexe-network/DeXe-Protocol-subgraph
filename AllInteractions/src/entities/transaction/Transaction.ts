import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { Transaction } from "../../../generated/schema";

export function getTransaction(hash: Bytes, block: BigInt, timestamp: BigInt, investor: Bytes): Transaction {
  let id = hash.toHexString();
  let transaction = Transaction.load(id);

  if (transaction == null) {
    transaction = new Transaction(id);
    transaction.block = block;
    transaction.timestamp = timestamp;
    transaction.type = BigInt.zero();
    transaction.user = investor;

    transaction.exchange = "";
    transaction.vest = "";

    transaction.poolCreate = "";
    transaction.proposalEdit = "";

    transaction.riskyProposalCreate = "";
    transaction.riskyProposalExchange = "";
    transaction.riskyProposalVest = "";

    transaction.investProposalClaimSupply = "";
    transaction.investProposalCreate = "";
    transaction.investProposalWithdraw = "";

    transaction.insuranceStake = "";
    transaction.getPerfomanceFee = "";
    transaction.onlyPool = "";
  }

  return transaction;
}
