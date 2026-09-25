// The schema exposes integer prices without a currency code; preserve its dollar notation.
export const money = value => `$${value.toLocaleString('en-US')}`;
