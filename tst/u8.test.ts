import { expect } from 'chai';
import { U8 } from "../src/u8";

describe('unsigned byte', () => {
    describe('addition', () => {
        it('happy path', () => {
           const res: U8 = new U8(1).add(new U8(1));
           expect(res.val).equal(2);
        });

        it('overflow', () => {
            const res: U8 = new U8(255).add(new U8(1));
            expect(res.val).equal(0);
        });
    });

    describe('subtraction', () => {
        it('happy path', () => {
          const res: U8 = new U8(1).subtract(new U8(1));
          expect(res.val).equal(0)
        });

        it('underflow', () => {
            const res: U8 = new U8(0).subtract(new U8(1));
            expect(res.val).equal(255);
        })
    })
});