import { Observable } from 'rxjs/Rx';
import pgp from 'pg-promise';
import { partialRight } from "lodash";

const connect = () => pgp()("postgres://postgres:pswd@localhost:5432/poland");

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
