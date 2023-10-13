"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyAmount = void 0;
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const jsbi_1 = __importDefault(require("jsbi"));
const token_1 = require("../token");
const fraction_1 = require("./fraction");
const big_js_1 = __importDefault(require("big.js"));
const toformat_1 = __importDefault(require("toformat"));
const internalConstants_1 = require("../../internalConstants");
const Big = (0, toformat_1.default)(big_js_1.default);
class CurrencyAmount extends fraction_1.Fraction {
    /**
     * Returns a new currency amount instance from the unitless amount of token, i.e. the raw amount
     * @param currency the currency in the amount
     * @param rawAmount the raw token or ether amount
     */
    static fromRawAmount(currency, rawAmount) {
        return new CurrencyAmount(currency, rawAmount);
    }
    /**
     * Construct a currency amount with a denominator that is not equal to 1
     * @param currency the currency
     * @param numerator the numerator of the fractional token amount
     * @param denominator the denominator of the fractional token amount
     */
    static fromFractionalAmount(currency, numerator, denominator) {
        return new CurrencyAmount(currency, numerator, denominator);
    }
    constructor(currency, numerator, denominator) {
        super(numerator, denominator);
        (0, tiny_invariant_1.default)(jsbi_1.default.lessThanOrEqual(this.quotient, internalConstants_1.MaxUint256), "AMOUNT");
        this.currency = currency;
        this.decimalScale = jsbi_1.default.exponentiate(jsbi_1.default.BigInt(10), jsbi_1.default.BigInt(currency.decimals));
    }
    add(other) {
        (0, tiny_invariant_1.default)(this.currency.equals(other.currency), "CURRENCY");
        const added = super.add(other);
        return CurrencyAmount.fromFractionalAmount(this.currency, added.numerator, added.denominator);
    }
    subtract(other) {
        (0, tiny_invariant_1.default)(this.currency.equals(other.currency), "CURRENCY");
        const subtracted = super.subtract(other);
        return CurrencyAmount.fromFractionalAmount(this.currency, subtracted.numerator, subtracted.denominator);
    }
    multiply(other) {
        const multiplied = super.multiply(other);
        return CurrencyAmount.fromFractionalAmount(this.currency, multiplied.numerator, multiplied.denominator);
    }
    divide(other) {
        const divided = super.divide(other);
        return CurrencyAmount.fromFractionalAmount(this.currency, divided.numerator, divided.denominator);
    }
    toSignificant(significantDigits = 6, format, rounding = internalConstants_1.Rounding.ROUND_DOWN) {
        return super
            .divide(this.decimalScale)
            .toSignificant(significantDigits, format, rounding);
    }
    toFixed(decimalPlaces = this.currency.decimals, format, rounding = internalConstants_1.Rounding.ROUND_DOWN) {
        (0, tiny_invariant_1.default)(decimalPlaces <= this.currency.decimals, "DECIMALS");
        return super
            .divide(this.decimalScale)
            .toFixed(decimalPlaces, format, rounding);
    }
    toExact(format = { groupSeparator: "" }) {
        Big.DP = this.currency.decimals;
        return new Big(this.quotient.toString())
            .div(this.decimalScale.toString())
            .toFormat(format);
    }
    toAsset(...args) {
        return `${this.toFixed(...args)} ${this.currency.symbol}`;
    }
    toExtendedAsset(...args) {
        return `${this.toFixed(...args)} ${this.currency.symbol}@${this.currency.contract}`;
    }
    static serialize(amount) {
        return JSON.stringify({
            currency: token_1.Token.serialize(amount.currency),
            numerator: amount.numerator.toString(),
            denominator: amount.denominator.toString(),
        });
    }
    static deserialize(data) {
        const parsedData = JSON.parse(data);
        const currency = token_1.Token.deserialize(parsedData.currency);
        const numerator = jsbi_1.default.BigInt(parsedData.numerator);
        const denominator = jsbi_1.default.BigInt(parsedData.denominator);
        return new CurrencyAmount(currency, numerator, denominator);
    }
}
exports.CurrencyAmount = CurrencyAmount;
