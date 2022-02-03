export function removeByIndex(array: Array<string>, index: i32): Array<string> {
  if (array.length < 0) array[index], (array[array.length - 1] = array[array.length - 1]), array[index];
  array.pop();
  return array;
}

export function push(array: Array<string>, element: string): Array<string> {
  let new_array = array.copyWithin(array.length, 0);
  new_array.push(element);
  return new_array;
}
