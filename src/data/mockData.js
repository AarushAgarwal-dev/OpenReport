// Mock financial data sources for the Custom Reporting Framework
import { v4 as uuidv4 } from 'uuid';

const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'BAC', 'GS', 'MS', 'WFC', 'C', 'BRK.B', 'V', 'MA', 'UNH', 'JNJ', 'PG', 'HD'];
const desks = ['Equities', 'Fixed Income', 'Derivatives', 'FX', 'Commodities'];
const traders = ['A. Smith', 'B. Johnson', 'C. Williams', 'D. Brown', 'E. Davis', 'F. Miller', 'G. Wilson', 'H. Moore'];
const accounts = ['ACCT-001', 'ACCT-002', 'ACCT-003', 'ACCT-004', 'ACCT-005', 'ACCT-006'];
const counterparties = ['Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Citadel', 'Two Sigma', 'Bridgewater', 'Renaissance', 'DE Shaw'];
const venues = ['NYSE', 'NASDAQ', 'CBOE', 'CME', 'ICE', 'BATS'];
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
const feeTypes = ['Commission', 'Exchange Fee', 'Clearing Fee', 'SEC Fee', 'Regulatory Fee', 'Settlement Fee'];
const settlementStatuses = ['Settled', 'Pending', 'Failed', 'Partial'];
const positionTypes = ['Long', 'Short'];
const assetClasses = ['Equity', 'Fixed Income', 'Options', 'Futures', 'FX Spot', 'FX Forward'];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max, decimals = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Generate Trades data
export function generateTrades(count = 500) {
  const trades = [];
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2026-05-18');

  for (let i = 0; i < count; i++) {
    const symbol = randomChoice(symbols);
    const side = Math.random() > 0.5 ? 'Buy' : 'Sell';
    const quantity = Math.floor(randomBetween(100, 50000, 0));
    const price = randomBetween(10, 500);
    const tradeDate = randomDate(startDate, endDate);
    const settlementDate = new Date(tradeDate);
    settlementDate.setDate(settlementDate.getDate() + 2);

    trades.push({
      tradeId: `TRD-${String(i + 1).padStart(6, '0')}`,
      symbol,
      side,
      quantity,
      price,
      notional: Number((quantity * price).toFixed(2)),
      tradeDate: formatDate(tradeDate),
      settlementDate: formatDate(settlementDate),
      desk: randomChoice(desks),
      trader: randomChoice(traders),
      account: randomChoice(accounts),
      counterparty: randomChoice(counterparties),
      venue: randomChoice(venues),
      currency: randomChoice(currencies),
      assetClass: randomChoice(assetClasses),
      status: randomChoice(settlementStatuses),
    });
  }
  return trades;
}

// Generate Positions data
export function generatePositions(count = 200) {
  const positions = [];
  const asOfDate = '2026-05-18';

  for (let i = 0; i < count; i++) {
    const symbol = randomChoice(symbols);
    const quantity = Math.floor(randomBetween(-100000, 100000, 0));
    const avgCost = randomBetween(20, 400);
    const marketPrice = avgCost * randomBetween(0.8, 1.3);
    const marketValue = Number((quantity * marketPrice).toFixed(2));
    const costBasis = Number((quantity * avgCost).toFixed(2));
    const unrealizedPnl = Number((marketValue - costBasis).toFixed(2));

    positions.push({
      positionId: `POS-${String(i + 1).padStart(5, '0')}`,
      symbol,
      positionType: quantity >= 0 ? 'Long' : 'Short',
      quantity: Math.abs(quantity),
      averageCost: Number(avgCost.toFixed(2)),
      marketPrice: Number(marketPrice.toFixed(2)),
      marketValue,
      costBasis,
      unrealizedPnl,
      unrealizedPnlPct: costBasis !== 0 ? Number(((unrealizedPnl / Math.abs(costBasis)) * 100).toFixed(2)) : 0,
      desk: randomChoice(desks),
      account: randomChoice(accounts),
      assetClass: randomChoice(assetClasses),
      currency: randomChoice(currencies),
      asOfDate,
    });
  }
  return positions;
}

// Generate Pricing data
export function generatePricing(count = 150) {
  const pricing = [];
  const dates = [];
  for (let d = new Date('2026-05-01'); d <= new Date('2026-05-18'); d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push(formatDate(new Date(d)));
    }
  }

  for (const symbol of symbols) {
    let basePrice = randomBetween(50, 400);
    for (const date of dates) {
      const change = randomBetween(-5, 5);
      basePrice = Math.max(1, basePrice + change);
      const open = Number(basePrice.toFixed(2));
      const high = Number((basePrice + randomBetween(0, 5)).toFixed(2));
      const low = Number((basePrice - randomBetween(0, 5)).toFixed(2));
      const close = Number((basePrice + randomBetween(-3, 3)).toFixed(2));
      const volume = Math.floor(randomBetween(100000, 50000000, 0));

      pricing.push({
        symbol,
        date,
        open,
        high,
        low,
        close,
        volume,
        vwap: Number(((high + low + close) / 3).toFixed(2)),
        change: Number((close - open).toFixed(2)),
        changePct: Number((((close - open) / open) * 100).toFixed(2)),
        currency: 'USD',
      });
    }
  }
  return pricing;
}

// Generate Fees data
export function generateFees(count = 300) {
  const fees = [];
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2026-05-18');

  for (let i = 0; i < count; i++) {
    const feeDate = randomDate(startDate, endDate);
    const feeType = randomChoice(feeTypes);
    let amount;
    switch (feeType) {
      case 'Commission': amount = randomBetween(5, 500); break;
      case 'Exchange Fee': amount = randomBetween(0.5, 50); break;
      case 'Clearing Fee': amount = randomBetween(1, 100); break;
      case 'SEC Fee': amount = randomBetween(0.01, 10); break;
      case 'Regulatory Fee': amount = randomBetween(0.1, 25); break;
      case 'Settlement Fee': amount = randomBetween(2, 75); break;
      default: amount = randomBetween(1, 100);
    }

    fees.push({
      feeId: `FEE-${String(i + 1).padStart(6, '0')}`,
      tradeId: `TRD-${String(Math.floor(randomBetween(1, 500, 0))).padStart(6, '0')}`,
      feeType,
      amount,
      currency: randomChoice(currencies),
      feeDate: formatDate(feeDate),
      desk: randomChoice(desks),
      account: randomChoice(accounts),
      counterparty: randomChoice(counterparties),
      status: randomChoice(['Accrued', 'Paid', 'Pending', 'Waived']),
    });
  }
  return fees;
}

// Data source metadata
export const dataSources = {
  trades: {
    name: 'Trades',
    description: 'Trade execution data including buy/sell orders, counterparties, and settlement info',
    icon: 'ArrowLeftRight',
    color: '#6366f1',
    columns: [
      { key: 'tradeId', label: 'Trade ID', type: 'string' },
      { key: 'symbol', label: 'Symbol', type: 'string' },
      { key: 'side', label: 'Side', type: 'string' },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'notional', label: 'Notional', type: 'number' },
      { key: 'tradeDate', label: 'Trade Date', type: 'date' },
      { key: 'settlementDate', label: 'Settlement Date', type: 'date' },
      { key: 'desk', label: 'Desk', type: 'string' },
      { key: 'trader', label: 'Trader', type: 'string' },
      { key: 'account', label: 'Account', type: 'string' },
      { key: 'counterparty', label: 'Counterparty', type: 'string' },
      { key: 'venue', label: 'Venue', type: 'string' },
      { key: 'currency', label: 'Currency', type: 'string' },
      { key: 'assetClass', label: 'Asset Class', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
    ],
    generator: generateTrades,
  },
  positions: {
    name: 'Positions',
    description: 'Current portfolio positions with P&L and market values',
    icon: 'Briefcase',
    color: '#10b981',
    columns: [
      { key: 'positionId', label: 'Position ID', type: 'string' },
      { key: 'symbol', label: 'Symbol', type: 'string' },
      { key: 'positionType', label: 'Position Type', type: 'string' },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'averageCost', label: 'Avg Cost', type: 'number' },
      { key: 'marketPrice', label: 'Market Price', type: 'number' },
      { key: 'marketValue', label: 'Market Value', type: 'number' },
      { key: 'costBasis', label: 'Cost Basis', type: 'number' },
      { key: 'unrealizedPnl', label: 'Unrealized P&L', type: 'number' },
      { key: 'unrealizedPnlPct', label: 'Unrealized P&L %', type: 'number' },
      { key: 'desk', label: 'Desk', type: 'string' },
      { key: 'account', label: 'Account', type: 'string' },
      { key: 'assetClass', label: 'Asset Class', type: 'string' },
      { key: 'currency', label: 'Currency', type: 'string' },
      { key: 'asOfDate', label: 'As Of Date', type: 'date' },
    ],
    generator: generatePositions,
  },
  pricing: {
    name: 'Pricing',
    description: 'Market pricing data including OHLCV and price changes',
    icon: 'TrendingUp',
    color: '#f59e0b',
    columns: [
      { key: 'symbol', label: 'Symbol', type: 'string' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'open', label: 'Open', type: 'number' },
      { key: 'high', label: 'High', type: 'number' },
      { key: 'low', label: 'Low', type: 'number' },
      { key: 'close', label: 'Close', type: 'number' },
      { key: 'volume', label: 'Volume', type: 'number' },
      { key: 'vwap', label: 'VWAP', type: 'number' },
      { key: 'change', label: 'Change', type: 'number' },
      { key: 'changePct', label: 'Change %', type: 'number' },
      { key: 'currency', label: 'Currency', type: 'string' },
    ],
    generator: generatePricing,
  },
  fees: {
    name: 'Fees',
    description: 'Fee and commission data across trading activities',
    icon: 'Receipt',
    color: '#ef4444',
    columns: [
      { key: 'feeId', label: 'Fee ID', type: 'string' },
      { key: 'tradeId', label: 'Trade ID', type: 'string' },
      { key: 'feeType', label: 'Fee Type', type: 'string' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'currency', label: 'Currency', type: 'string' },
      { key: 'feeDate', label: 'Fee Date', type: 'date' },
      { key: 'desk', label: 'Desk', type: 'string' },
      { key: 'account', label: 'Account', type: 'string' },
      { key: 'counterparty', label: 'Counterparty', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
    ],
    generator: generateFees,
  },
};

// Saved report templates
export const defaultTemplates = [
  {
    id: uuidv4(),
    name: 'Daily Trade Blotter',
    description: 'All trades executed today with full details',
    dataSource: 'trades',
    columns: ['tradeId', 'symbol', 'side', 'quantity', 'price', 'notional', 'tradeDate', 'desk', 'trader', 'status'],
    filters: [],
    sortBy: { key: 'tradeDate', direction: 'desc' },
    groupBy: null,
    createdAt: '2026-05-15T10:00:00Z',
    updatedAt: '2026-05-15T10:00:00Z',
    schedule: null,
    isFavorite: true,
  },
  {
    id: uuidv4(),
    name: 'Position Summary by Desk',
    description: 'Current positions grouped by trading desk with P&L',
    dataSource: 'positions',
    columns: ['symbol', 'positionType', 'quantity', 'marketValue', 'unrealizedPnl', 'unrealizedPnlPct', 'desk', 'assetClass'],
    filters: [],
    sortBy: { key: 'marketValue', direction: 'desc' },
    groupBy: 'desk',
    createdAt: '2026-05-14T08:00:00Z',
    updatedAt: '2026-05-16T14:30:00Z',
    schedule: { frequency: 'daily', time: '08:00' },
    isFavorite: true,
  },
  {
    id: uuidv4(),
    name: 'Fee Breakdown Report',
    description: 'Comprehensive fee analysis by type and counterparty',
    dataSource: 'fees',
    columns: ['feeId', 'tradeId', 'feeType', 'amount', 'currency', 'feeDate', 'desk', 'counterparty', 'status'],
    filters: [],
    sortBy: { key: 'amount', direction: 'desc' },
    groupBy: 'feeType',
    createdAt: '2026-05-10T12:00:00Z',
    updatedAt: '2026-05-17T09:00:00Z',
    schedule: { frequency: 'weekly', day: 'Monday', time: '09:00' },
    isFavorite: false,
  },
  {
    id: uuidv4(),
    name: 'Market Price Monitor',
    description: 'Latest pricing data with volume and price changes',
    dataSource: 'pricing',
    columns: ['symbol', 'date', 'close', 'volume', 'change', 'changePct', 'vwap'],
    filters: [],
    sortBy: { key: 'date', direction: 'desc' },
    groupBy: null,
    createdAt: '2026-05-12T07:00:00Z',
    updatedAt: '2026-05-18T07:00:00Z',
    schedule: { frequency: 'daily', time: '07:00' },
    isFavorite: false,
  },
];
