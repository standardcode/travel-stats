import { expect } from 'chai';
import { accumulator } from "../../js/util";

describe('accumulator', () => {
    it('should add element at the end of an array', () => {
        expect(accumulator([4, 7], 2)).to.eql([4, 7, 2]);
    });
});