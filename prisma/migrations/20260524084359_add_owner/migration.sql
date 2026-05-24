-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_stock_holdings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "market" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "stockName" TEXT NOT NULL,
    "owner" TEXT NOT NULL DEFAULT '我',
    "shares" REAL NOT NULL,
    "avgCost" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_stock_holdings" ("accountName", "avgCost", "createdAt", "id", "market", "shares", "stockName", "ticker", "updatedAt") SELECT "accountName", "avgCost", "createdAt", "id", "market", "shares", "stockName", "ticker", "updatedAt" FROM "stock_holdings";
DROP TABLE "stock_holdings";
ALTER TABLE "new_stock_holdings" RENAME TO "stock_holdings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
