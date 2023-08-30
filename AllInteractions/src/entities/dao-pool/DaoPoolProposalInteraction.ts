import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoPoolProposalInteraction } from "../../../generated/schema";

export function getDaoPoolProposalInteraction(
  hash: Bytes,
  pool: Address,
  interactionType: BigInt,
  personal: BigInt,
  micropool: BigInt,
  treasury: BigInt,
  count: BigInt
): DaoPoolProposalInteraction {
  let id = hash.concatI32(count.toI32());
  let interaction = DaoPoolProposalInteraction.load(id);

  if (interaction == null) {
    interaction = new DaoPoolProposalInteraction(id);
    interaction.pool = pool;
    interaction.interactionType = interactionType;

    interaction.personalVote = personal;
    interaction.micropoolVote = micropool;
    interaction.treasuryVote = treasury;

    interaction.transaction = Bytes.empty();
  }

  return interaction;
}
