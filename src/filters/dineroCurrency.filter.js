import Dinero from "dinero.js";

export function formatCurrencyWithDinero(value, factor = 10 ** 2) {
  if (Number.isNaN(Number(value))) {
    return "";
  }
  const amount = Number.parseFloat(value).toFixed(2) * factor;
  const dineroObject = Dinero({ amount: amount, currency: "INR" });
  const dineroAmount = dineroObject.toRoundedUnit(2);
  return Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(dineroAmount);
}
