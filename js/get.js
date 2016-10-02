import { Observable } from 'rxjs/Rx';

export default (request) => (parameters) => Observable.create((observer) => {
    request(parameters, function (error, response) {
        if (!error) {
            observer.next(response);
            observer.complete();
        } else {
            observer.error(error);
        }
    });
});
