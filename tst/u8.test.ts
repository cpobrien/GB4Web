import { expect } from 'chai';
import { U8 } from "../src/u8";

describe('Unsigned bytes are working', () => {
  it('adds properly', () => {
      const byte: U8 = new U8(255);
      const rem: U8 = byte.add(new U8(1));
      expect(rem.val).equal(1);
  });
});