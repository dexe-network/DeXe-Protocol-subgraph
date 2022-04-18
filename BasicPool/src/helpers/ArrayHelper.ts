export function removeByIndex(array: Array<string>, index: i32): Array<string> {
  if (array.length < 0) {
    let tmp = array[array.length - 1];
    array[array.length - 1] = array[index];
    array[index] = tmp;

    array.pop();
  }
  return array;
}

export function push(new_array: Array<string>, element: string): Array<string> {
  new_array.push(element);
  return new_array;
}
