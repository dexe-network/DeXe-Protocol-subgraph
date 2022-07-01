export function upcastCopy<T extends V, V>(array: Array<T>): Array<V> {
  let newArr = new Array<V>();

  for (let i = 0; i < array.length; i++) {
    newArr.push(array[i]);
  }

  return newArr;
}
