import Dinero from "dinero.js";

export function formatCurrencyWithDinero(value, factor = 10 ** 2) {
  const newValue = Number(value);

  if (Number.isNaN(newValue)) {
    return "";
  }


  const amount = Number.parseFloat((Number.parseFloat(newValue).toFixed(2) * factor).toFixed(2));
  const dineroObject = Dinero({ amount: amount, currency: "INR" });
  const dineroAmount = dineroObject.toRoundedUnit(2);
  return Intl.NumberFormat("en-IN", { currency: "INR", style: "currency" }).format(dineroAmount);
}
