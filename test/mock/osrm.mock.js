import { delay } from "./util";

let last;

export default () => {
    let requests = 0;
    let maxRequests = 0;

    const later = (cb, response) => delay(() => {
        maxRequests = Math.max(requests, maxRequests);
        --requests;
        cb(undefined, response);
    });

    return (last = {
        route: ({ coordinates: [from, to] }, cb) => {
            ++requests;
            const distance = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
            later(cb, {
                routes: [{ distance, duration: distance / 10 }]
            })
        },
        nearest: ({ coordinates: [point] }, cb) => {
            ++requests;
            later(cb, {
                waypoints: [{ location: [point[0] + .5, point[1] + .3] }]
            })
        },
        get top() {
            return maxRequests;
        }
    })
};

export const lastOSRM = () => last;