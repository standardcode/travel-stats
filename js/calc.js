import { Observable } from 'rxjs/Rx';
import { alignPoints, calculateCitiesRoutes, calculateVillagesRoutes } from './route';
import self from "./self";
import { log } from "./config";

class Calc {
    constructor(dao, quantity) {
        this.dao = dao;
        this.quantity = quantity;
    }

    align() {
        return this.dao.clearRoutes()
            .concat(this.dao.select(this.quantity))
            .flatMap(alignPoints)
            .flatMap(this.dao.updateCoordinates);
    }

    store() {
        return this
            .flatMap(this.dao.storeRoutes)
            .map((v, i) => {
                const complexity = this.complexity();
                log(`${(100 * (i + 1) / complexity).toFixed(2)}%`);
                return v;
            })
    }
}

export class Villages extends Calc {
    routes(villages) {
        return Observable.from(villages).flatMap(calculateVillagesRoutes);
    }

    complexity() {
        return this.quantity;
    }
}

export class Cities extends Calc {
    routes(cities) {
        return calculateCitiesRoutes(cities).merge(self(cities));
    }

    complexity() {
        return this.quantity ** 2;
    }
}
