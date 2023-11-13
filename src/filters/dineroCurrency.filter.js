import Dinero from "dinero.js";

export function formatCurrencyWithDinero(value, factor = 10 ** 2) {
  const newValue = Number(value);
  if (Number.isNaN(newValue)) {
    return "";
  }
  console.trace('formatCurrency', { newValue });
  const amount = Number.parseFloat(newValue).toFixed(2) * factor;
  const dineroObject = Dinero({ amount: amount, currency: "INR" });
  const dineroAmount = dineroObject.toRoundedUnit(2);
  return Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(dineroAmount);
}
