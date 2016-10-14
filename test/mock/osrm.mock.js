export default () => ({
    route: ({ coordinates: [from, to] }, cb) => {
        const distance = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
        cb(undefined, {
            routes: [{ distance, duration: distance / 10 }]
        })
    },
    nearest: ({ coordinates: [point] }, cb) => {
        cb(undefined, {
            waypoints: [{ location: [point[0] + .5, point[1] + .3] }]
        })
    }
});