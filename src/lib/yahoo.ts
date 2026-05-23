import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

export async function fetchPrice(ticker: string): Promise<number> {
  const quote = await yf.quote(ticker);
  const price = quote.regularMarketPrice;
  if (price == null) throw new Error(`No price for ${ticker}`);
  return price;
}

export async function fetchUsdTwdRate(): Promise<number> {
  return fetchPrice("TWD=X");
}
