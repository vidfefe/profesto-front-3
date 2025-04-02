type CurrencyFormatterProps = {
  currency: string | undefined;
  amount: number | string | undefined;
};

export const currencyFormatter = ({
  currency,
  amount,
}: CurrencyFormatterProps): string | undefined => {
  const value = Number(amount);
  if (isNaN(value) || !currency) return undefined;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currencyDisplay: 'narrowSymbol',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(/^(\D+)/, '$1 ')
    .replace(/\s+/, ' ');
};
