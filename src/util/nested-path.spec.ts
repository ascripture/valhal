import { nestedPathValue } from "./nested-path";

describe('NestedPath', () =>  {
    it('returns the correct value for multiple paths', () => {
        const obj = {
            x: {
                y: {
                    z: 754
                }
            }
        };

        const value = nestedPathValue<number>(obj, ['x', 'y', 'z'].values());
        
        expect(value).toEqual(754);
    });

    it('returns the correct value for single paths', () => {
        const obj = {
            x: 'test'
        };

        const value = nestedPathValue<number>(obj, ['x'].values());
        
        expect(value).toEqual('test');
    });

    it('returns the any object', () => {
        const obj = {
            x: {
                y: {
                    z: 754
                }
            }
        };

        const value = nestedPathValue(obj, ['x', 'y'].values());
        
        expect(value).toEqual({
            z: 754
        });
    });

    it('returns undefined when it couldnt find the value', () => {
        const obj = {
            x: {
                y: {
                    z: 754
                }
            }
        };

        const value = nestedPathValue<number>(obj, ['x', 'y', 'a'].values());
        
        expect(value).toEqual(undefined);
    });
});