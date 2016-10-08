export const accumulator = (acc, v) => [...acc, v];

export const grow = (min, max) => {
    let i = min;
    return () => i > max ? max : ++i;
};
