import { take } from "rxjs/operators";
import { EntityStore } from "./entity-store";

describe('EntityStore', () => {
    it('adds entities to the store', done => {
        const store = new EntityStore<{ id: string; value: number; }>();

        let run = 0;
        store.selectEntity('x').subscribe(data => {
            expect(data?.value).toEqual(100);
            run++;
        });

        store.add({
            id: 'x',
            value: 100
        });

        store.add({
            id: 'y',
            value: 200
        });

        store.selectEntity('y').subscribe(data => {
            expect(data?.value).toEqual(200);
        });

        let value = 0;
        let called = 0;
        store.asObservable().subscribe(store => {
            value = Array.from(store.data.values()).reduce((acc, next) => acc + (next?.value ?? 0), 0);
            called++;
        });

        setTimeout(() => {
            expect(value).toEqual(300);
            expect(called).toEqual(1);
            expect(run).toEqual(1);
            done();
        })
    });

    it('removes entities from the store', done => {
        const store = new EntityStore<{ id: string; value: number; }>();

        store.add({
            id: 'x',
            value: 100
        });

        store.add({
            id: 'y',
            value: 200
        });

        store.add({
            id: 'z',
            value: 300
        });

        store.selectEntity('y').pipe(take(1)).subscribe(result => {
            expect(result?.value).toEqual(200);
        });

        const entities1 = store.getAll();

        store.remove('y');

        const entities2 = store.getAll();

        expect(entities1.data.get('y')?.value).toEqual(200);
        expect(entities2.data.get('y')).toBeUndefined();

        store.selectEntity('y').subscribe(result => {
            expect(result).toBeUndefined();
            done();
        });
    });
});