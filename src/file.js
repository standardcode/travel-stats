import {Observable} from 'rxjs/Rx';
import csv from "fast-csv";

export const saveCsv = (file, data) => Observable.create((observer) => {
    csv.writeToPath(`${file}.csv`, data, {headers: true})
        .on("finish", function () {
            observer.next(file);
            observer.complete();
        });
});

export const openCsv = (file, data) => Observable.create((observer) => {
    csv.fromPath(`${file}.csv`, {
        headers: true
    }).on("data", (data) => {
        observer.next(data);
    }).on("end", () => {
        observer.complete();
    });
});