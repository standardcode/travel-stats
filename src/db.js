import { Observable } from 'rxjs/Rx';
import pgp from 'pg-promise';
import { partialRight } from "lodash";

const connect = () => pgp()("postgres://postgres:pswd@localhost:5432/poland");

export const execute = (query, params = [], method = "none") => Observable.create(observer => {
    const db = connect();
    db.connect().then(() => db[method](query, params).then((result) => {
            observer.next(result);
            observer.complete();
        })
    );
});

export const select = partialRight(execute, "any");

export default (query, table, unfold) => {
    return Observable.create(observer => {
        const db = connect();
        db.connect().then(() =>
            Promise.all(table.map(row => db.none(query, unfold(row)))).then(
                () => {
                    observer.next(table);
                    observer.complete()
                }
            )
        )
    });
}