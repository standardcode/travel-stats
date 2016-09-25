import { Observable } from 'rxjs/Rx';
import pgp from 'pg-promise';
import { partialRight } from "lodash";
import { dbServer } from "./config";

const connect = () => pgp()(dbServer);

export const execute = (query, params = [], method = "none") => {
    const db = connect();
    return Observable.create(observer => {
        db[method](query, params).then((result) => {
            observer.next(result);
            observer.complete();
        })
    });
};

export const select = partialRight(execute, "any");

export const insert = (query, unfold) => {
    const db = connect();
    return (row) => Observable.create(observer => {
        db.none(query, unfold(row)).then(() => {
            observer.next(row);
            observer.complete();
        })
    });
};
