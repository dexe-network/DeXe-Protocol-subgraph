import { PairCreated } from "../../generated/Factory/Factory";
import { Pair } from "../../generated/schema"
export function handleNewPair(event: PairCreated): void {
  
  let pair = new Pair(event.params.pair.toHexString())
  pair.save()
}
