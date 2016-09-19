import {Observable} from 'rxjs/Rx';
import request from "request";

export default (url) => Observable.defer(() => Observable.create((observer) => {
    request(url, function (error, response, body) {
        if (!error) {
            observer.next(JSON.parse(body));
            observer.complete();
        } else {
            observer.error(error);
        }
    });
}));
