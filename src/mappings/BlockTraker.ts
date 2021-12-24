import { BigInt, ethereum } from "@graphprotocol/graph-ts"
export function onNewBlock(event: ethereum.Event): void {
    if (event.block.number.mod(BigInt.fromU64(100)).equals(BigInt.fromI32(0))){
        // logic
    }
}