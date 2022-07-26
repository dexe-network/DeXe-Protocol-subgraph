export function upcastCopy<T extends V, V>(array: Array<T>): Array<V> {
  let newArr = new Array<V>();

  for (let i = 0; i < array.length; i++) {
    newArr.push(array[i]);
  }

  return newArr;
}

export function extendArray<T>(array: Array<T>, elements: Array<T>): Array<T> {
  for (let i = 0; i < elements.length; i++) {
    if (!array.includes(elements[i])) {
      array.push(elements[i]);
    }
  }
  return array;
}
