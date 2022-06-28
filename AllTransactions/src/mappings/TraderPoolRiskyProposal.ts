import { ProposalDivested } from "../../generated/templates/TraderPool/TraderPool";
import {
  ProposalCreated,
  ProposalExchanged,
  ProposalInvested,
} from "../../generated/templates/TraderPoolRiskyProposal/TraderPoolRiskyProposal";

export function onProposalCreated(event: ProposalCreated): void {
  event.params.proposalId;
  event.params.token;
  event.params.user;
}

export function onProposalExchange(event: ProposalExchanged): void {
  event.params.proposalId;
  event.params.fromToken;
  event.params.toToken;
  event.params.fromVolume;
  event.params.toVolume;
  event.params.user;
}

export function onProposalInvest(event: ProposalInvested): void {
  event.params.investedBase;
  event.params.receivedLP2;
  event.params.proposalId;
  event.params.user;
}

export function onProposalDivest(event: ProposalDivested): void {
  event.params.receivedBase;
  event.params.divestedLP2;
  event.params.proposalId;
  event.params.user;
}
