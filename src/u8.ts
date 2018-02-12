class U8 {
    public readonly val: number;
    constructor(val: number) { this.val = val & 0xFF; }
    add(byte: U8): U8 {
        const sum: number = this.val + byte.val;
        return new U8(sum % 0xF00);
    }

    subtract(byte: U8): U8 {
        const difference: number = this.val - byte.val;
        return new U8(difference % 0xFF);
    }
}

export {U8}
