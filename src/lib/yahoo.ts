import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

export async function fetchPrice(ticker: string): Promise<number> {
  const quote = await yf.quote(ticker);
  const price = quote.regularMarketPrice;
  if (price == null) throw new Error(`No price for ${ticker}`);
  return price;
}

// 台股：先試上市（.TW），失敗再試上櫃（.TWO）
export async function fetchTwPrice(ticker: string): Promise<number> {
  try {
    return await fetchPrice(`${ticker}.TW`);
  } catch {
    return await fetchPrice(`${ticker}.TWO`);
  }
}

export async function fetchUsdTwdRate(): Promise<number> {
  return fetchPrice("TWD=X");
}
