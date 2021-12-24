
export function removeByIndex(array: Array<string>, index:i32): Array<string>{
    for (let i = index; i < array.length-1; i++) {
        array[i] = array[i+1];
    }
    array.pop();
    return array;
}