const later = (cb, response) => setTimeout(() => cb(undefined, response), 10 * Math.random());

export default () => ({
    route: ({ coordinates: [from, to] }, cb) => {
        const distance = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
        later(cb, {
            routes: [{ distance, duration: distance / 10 }]
        })
    },
    nearest: ({ coordinates: [point] }, cb) => {
        later(cb, {
            waypoints: [{ location: [point[0] + .5, point[1] + .3] }]
        })
    }
});