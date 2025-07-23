export const formattedAmount = (amount: number) => {
  if (amount >= 1_00_00_000) {
    return `${(amount / 1_00_00_000).toFixed(0)} Cr`;
  } else if (amount >= 1_00_000) {
    return `${(amount / 1_00_000).toFixed(0)} L`;
  } else if (amount >= 1000) {
    return `${amount.toLocaleString('en-IN')}`;
  } else {
    return `${amount}`;
  }
};
