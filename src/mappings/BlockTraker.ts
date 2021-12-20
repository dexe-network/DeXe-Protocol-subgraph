import { BigInt, ethereum } from "@graphprotocol/graph-ts"
export function onNewBlock(event: ethereum.Event): void {
    if (event.block.timestamp.mod(BigInt.fromU64(10*60*1000)).equals(BigInt.fromI32(0))){
        // logic
    }
}