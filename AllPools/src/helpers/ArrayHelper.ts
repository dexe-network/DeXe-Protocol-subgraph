import { Address, Bytes } from "@graphprotocol/graph-ts";

export function extendArray(array: Array<Bytes>, elements: Array<Address>): Array<Bytes> {
  for (let i = 0; i < elements.length; i++) {
    if (!array.includes(elements[i])) {
      array.push(elements[i]);
    }
  }
  return array;
}

export function reduceArray(array: Array<Bytes>, elements: Array<Address>): Array<Bytes> {
  for (let i = 0; i < elements.length; i++) {
    if (array.includes(elements[i])) {
      let index = array.indexOf(elements[i]);

      let tmp = array[array.length - 1];
      array[array.length - 1] = array[index];
      array[index] = tmp;

      array.pop();
    }
  }
  return array;
}
