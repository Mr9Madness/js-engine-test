import { dlopen, FFIType, suffix } from 'bun:ffi';

const { i32 } = FFIType;
const path = `libmain.${suffix}`;

export const lib = dlopen(path, {
    add: {
        args: [i32, i32],
        returns: i32,
    },
});
