import { dlopen, FFIType, suffix } from 'bun:ffi';

const { i32 } = FFIType;

const path = `dist/libout.${suffix}`;
console.log('tryin to load', path)

export const lib = dlopen(path, {
    add: {
        args: [i32, i32],
        returns: i32,
    },
});
