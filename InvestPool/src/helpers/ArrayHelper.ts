export function deleteByIndex<T>(array: Array<T>, index: i32): Array<T> {
  let tmp = array[array.length - 1];
  array[array.length - 1] = array[index];
  array[index] = tmp;

  array.pop();

  return array;
}
