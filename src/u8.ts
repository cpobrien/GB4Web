class U8 {
    public readonly val: number;
    constructor(val: number) { this.val = val & 0xFF; }
    add(byte: U8): U8 {
        const sum: number = this.val + byte.val;
        return new U8(sum % 0xFF);
    }
}

export {U8}
