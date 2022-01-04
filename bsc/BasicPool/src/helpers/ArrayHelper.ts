
export function removeByIndex(array: Array<string>, index:i32): Array<string>{
    array[index], array[array.length-1] = array[array.length-1], array[index];
    array.pop();
    return array;
}