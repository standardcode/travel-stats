import { Observable } from 'rxjs/Rx';
import pgp from 'pg-promise';
import { partialRight } from "lodash";
import { dbServer, log } from "./config";

const connect = () => pgp()(dbServer);

function handleError(observer, query, params) {
    return function (e) {
        log(`Query: ${query}\nParameters: ${JSON.stringify(params)}\n`, e);
        observer.error(e);
    }
}

const exec = (query, params = [], method = "none") => {
    const db = connect();
    return Observable.create(observer => {
        db[method](query, params).then((result) => {
            observer.next(result);
            observer.complete();
        }).catch(handleError(observer, query, params))
    });
};

export const execute = (query) => exec(query).ignoreElements();

export const select = partialRight(exec, "any");

export const insert = (query, unfold) => {
    const db = connect();
    return (row) => Observable.create(observer => {
        db.none(query, unfold(row)).then(() => {
            observer.next(row);
            observer.complete();
        }).catch(handleError(observer, query, row))
    });
};
