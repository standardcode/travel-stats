import { Observable } from 'rxjs/Rx';
import pgp from 'pg-promise';

const connect = () => pgp()("postgres://postgres:pswd@localhost:5432/poland");

export const execute = (query) => Observable.create(observer => {
    const db = connect();
    db.connect().then(() => db.none(query).then(() => {
            observer.next();
            observer.complete()
        })
    );
});

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