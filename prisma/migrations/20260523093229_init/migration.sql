-- CreateTable
CREATE TABLE "stock_holdings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "market" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "stockName" TEXT NOT NULL,
    "shares" REAL NOT NULL,
    "avgCost" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "price_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticker" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "priceLocal" REAL NOT NULL,
    "priceTwd" REAL NOT NULL,
    "usdTwdRate" REAL,
    "snapshotAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "holdingId" TEXT,
    CONSTRAINT "price_snapshots_holdingId_fkey" FOREIGN KEY ("holdingId") REFERENCES "stock_holdings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "portfolio_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "totalValueTwd" REAL NOT NULL,
    "twValueTwd" REAL NOT NULL,
    "usValueTwd" REAL NOT NULL,
    "snapshotAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
