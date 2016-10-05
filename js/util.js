export const accumulator = (acc, city) => {
    acc.push(city);
    return acc;
};

export const grow = (min, max) => {
    let i = min;
    return () => i > max ? max : ++i;
};
