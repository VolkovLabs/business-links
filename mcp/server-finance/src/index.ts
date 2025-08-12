import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3006;

const app = express();

/**
 * Enable CORS
 */
app.use(cors());
app.use(express.json());

/**
 * MCP Server setup
 */
const server = new Server({
  name: 'finance-mcp-server',
  version: '1.0.0',
});

/**
 * Mock stock data
 */
const stockData = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    change: 2.15,
    changePercent: 1.24,
    volume: 45678900,
    marketCap: 2750000000000,
    pe: 28.5,
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    change: -1.23,
    changePercent: -0.85,
    volume: 23456700,
    marketCap: 1800000000000,
    pe: 25.2,
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.85,
    change: 5.67,
    changePercent: 1.52,
    volume: 34567800,
    marketCap: 2800000000000,
    pe: 32.1,
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 248.42,
    change: -8.15,
    changePercent: -3.18,
    volume: 56789000,
    marketCap: 790000000000,
    pe: 45.8,
  },
  AMZN: {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 145.24,
    change: 3.21,
    changePercent: 2.26,
    volume: 45678900,
    marketCap: 1500000000000,
    pe: 60.3,
  },
};

/**
 * Mock currency data
 */
const currencyData = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    rate: 1.0,
    change: 0.0,
    changePercent: 0.0,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    rate: 0.85,
    change: 0.002,
    changePercent: 0.24,
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    rate: 0.73,
    change: -0.005,
    changePercent: -0.68,
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    rate: 110.25,
    change: 0.15,
    changePercent: 0.14,
  },
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    rate: 6.45,
    change: -0.02,
    changePercent: -0.31,
  },
};

/**
 * Mock crypto data
 */
const cryptoData = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 43250.0,
    change: 1250.0,
    changePercent: 2.98,
    volume: 28500000000,
    marketCap: 850000000000,
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2650.0,
    change: 85.0,
    changePercent: 3.31,
    volume: 18500000000,
    marketCap: 320000000000,
  },
  ADA: {
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.45,
    change: -0.02,
    changePercent: -4.26,
    volume: 1250000000,
    marketCap: 15000000000,
  },
};

/**
 * Define finance tools
 */
const tools = [
  {
    name: 'get_stock_price',
    description: 'Get current stock price and information for a specific symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., AAPL, GOOGL, MSFT)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_currency_rate',
    description: 'Get current exchange rate for a specific currency',
    inputSchema: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          description: 'Source currency code (e.g., USD, EUR, GBP)',
        },
        to: {
          type: 'string',
          description: 'Target currency code (e.g., USD, EUR, GBP)',
        },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'get_crypto_price',
    description: 'Get current cryptocurrency price and information',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Cryptocurrency symbol (e.g., BTC, ETH, ADA)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_market_summary',
    description: 'Get market summary and indices information',
    inputSchema: {
      type: 'object',
      properties: {
        market: {
          type: 'string',
          description: 'Market to get summary for',
          enum: ['US', 'EU', 'ASIA'],
          default: 'US',
        },
      },
    },
  },
  {
    name: 'get_economic_indicators',
    description: 'Get economic indicators and statistics',
    inputSchema: {
      type: 'object',
      properties: {
        indicator: {
          type: 'string',
          description: 'Economic indicator to get',
          enum: ['inflation', 'unemployment', 'gdp', 'interest_rate'],
        },
        country: {
          type: 'string',
          description: 'Country code (e.g., US, EU, JP)',
          default: 'US',
        },
      },
      required: ['indicator'],
    },
  },
];

/**
 * Tool handlers
 */
const toolHandlers = {
  get_stock_price: async (args: any) => {
    const { symbol } = args;

    if (!stockData[symbol as keyof typeof stockData]) {
      throw new Error(`Stock data not available for ${symbol}`);
    }

    const stock = stockData[symbol as keyof typeof stockData];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ...stock,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    };
  },

  get_currency_rate: async (args: any) => {
    const { from, to } = args;

    if (!currencyData[from as keyof typeof currencyData] || !currencyData[to as keyof typeof currencyData]) {
      throw new Error(`Currency data not available for ${from} or ${to}`);
    }

    const fromCurrency = currencyData[from as keyof typeof currencyData];
    const toCurrency = currencyData[to as keyof typeof currencyData];
    const rate = toCurrency.rate / fromCurrency.rate;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            from: fromCurrency.code,
            to: toCurrency.code,
            rate,
            change: toCurrency.change - fromCurrency.change,
            changePercent: toCurrency.changePercent - fromCurrency.changePercent,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    };
  },

  get_crypto_price: async (args: any) => {
    const { symbol } = args;

    if (!cryptoData[symbol as keyof typeof cryptoData]) {
      throw new Error(`Cryptocurrency data not available for ${symbol}`);
    }

    const crypto = cryptoData[symbol as keyof typeof cryptoData];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ...crypto,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    };
  },

  get_market_summary: async (args: any) => {
    const { market = 'US' } = args;

    /**
     *  Mock economic indicators data
     */
    const marketSummaries: Record<string, any> = {
      US: {
        market: 'US',
        indices: {
          'S&P 500': { value: 4750.25, change: 15.75, changePercent: 0.33 },
          'Dow Jones': { value: 37500.5, change: 125.3, changePercent: 0.34 },
          NASDAQ: { value: 15250.75, change: 85.45, changePercent: 0.56 },
        },
        volume: 4500000000,
        advancers: 2456,
        decliners: 1890,
      },
      EU: {
        market: 'EU',
        indices: {
          'FTSE 100': { value: 7650.25, change: -25.5, changePercent: -0.33 },
          DAX: { value: 16850.75, change: 125.8, changePercent: 0.75 },
          'CAC 40': { value: 7250.5, change: 45.25, changePercent: 0.63 },
        },
        volume: 2800000000,
        advancers: 1850,
        decliners: 2100,
      },
      ASIA: {
        market: 'ASIA',
        indices: {
          'Nikkei 225': { value: 32500.75, change: 250.45, changePercent: 0.78 },
          'Hang Seng': { value: 16850.25, change: -125.3, changePercent: -0.74 },
          'Shanghai Composite': { value: 3150.5, change: 45.75, changePercent: 1.47 },
        },
        volume: 3200000000,
        advancers: 2200,
        decliners: 1750,
      },
    };

    if (!marketSummaries[market]) {
      throw new Error(`Market summary not available for ${market}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ...marketSummaries[market],
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    };
  },

  get_economic_indicators: async (args: any) => {
    const { indicator, country = 'US' } = args;
    /**
     * Mock economic indicators data
     */
    const indicatorsData: Record<string, Record<string, any>> = {
      inflation: {
        US: { value: 3.2, previous: 3.1, change: 0.1, period: '2024-01' },
        EU: { value: 2.8, previous: 2.9, change: -0.1, period: '2024-01' },
        JP: { value: 2.5, previous: 2.4, change: 0.1, period: '2024-01' },
      },
      unemployment: {
        US: { value: 3.7, previous: 3.8, change: -0.1, period: '2024-01' },
        EU: { value: 6.5, previous: 6.6, change: -0.1, period: '2024-01' },
        JP: { value: 2.6, previous: 2.7, change: -0.1, period: '2024-01' },
      },
      gdp: {
        US: { value: 2.1, previous: 2.0, change: 0.1, period: 'Q4 2023' },
        EU: { value: 0.8, previous: 0.7, change: 0.1, period: 'Q4 2023' },
        JP: { value: 1.2, previous: 1.1, change: 0.1, period: 'Q4 2023' },
      },
      interest_rate: {
        US: { value: 5.25, previous: 5.5, change: -0.25, period: '2024-01' },
        EU: { value: 4.5, previous: 4.75, change: -0.25, period: '2024-01' },
        JP: { value: -0.1, previous: -0.1, change: 0.0, period: '2024-01' },
      },
    };

    if (!indicatorsData[indicator] || !indicatorsData[indicator][country]) {
      throw new Error(`Economic indicator data not available for ${indicator} in ${country}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            indicator,
            country,
            ...indicatorsData[indicator][country],
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    };
  },
};

/**
 * Register tool handlers
 */
Object.entries(toolHandlers).forEach(([name, handler]) => {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name: toolName, arguments: args } = request.params;

    if (!toolHandlers[toolName as keyof typeof toolHandlers]) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    return await toolHandlers[toolName as keyof typeof toolHandlers](args);
  });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: 'finance-mcp-server',
    version: '1.0.0',
    availableTools: tools.map((t) => t.name),
  });
});

/**
 *Tools list endpoint
 */
app.get('/tools', (req, res) => {
  res.json({ tools });
});

/**
 * Tool execution endpoint
 */
app.post('/call-tool', async (req, res) => {
  try {
    const { name, arguments: args } = req.body;

    if (!toolHandlers[name as keyof typeof toolHandlers]) {
      return res.status(400).json({
        error: `Tool '${name}' not found`,
      });
    }

    const result = await toolHandlers[name as keyof typeof toolHandlers](args);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * MCP protocol endpoint
 */
app.post('/', async (req, res) => {
  try {
    const { jsonrpc, id, method, params } = req.body;

    /**
     * Validate JSON-RPC 2.0 format
     */
    if (jsonrpc !== '2.0' || !method) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: id || null,
        error: {
          code: -32600,
          message: 'Invalid Request',
        },
      });
    }

    if (method === 'initialize') {
      /**
       * Handle MCP initialization
       */
      res.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'finance-mcp-server',
            version: '1.0.0',
          },
        },
      });
    } else if (method === 'tools/list') {
      res.json({
        jsonrpc: '2.0',
        id,
        result: { tools },
      });
    } else if (method === 'tools/call') {
      const { name, arguments: args } = params;

      const handler = toolHandlers[name as keyof typeof toolHandlers];
      if (!handler) {
        return res.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Tool '${name}' not found`,
          },
        });
      }

      try {
        const result = await handler(args);
        res.json({
          jsonrpc: '2.0',
          id,
          result,
        });
      } catch (error) {
        res.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : 'Internal error',
          },
        });
      }
    } else if (method === 'notifications/initialized') {
      /**
       *  Handle initialization notification
       */
      res.json({
        jsonrpc: '2.0',
        id,
        result: {},
      });
    } else if (method === 'notifications/exit') {
      /**
       * Handle exit notification
       */
      res.json({
        jsonrpc: '2.0',
        id,
        result: {},
      });
    } else {
      res.json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`,
        },
      });
    }
  } catch (error) {
    res.json({
      jsonrpc: '2.0',
      id: req.body.id || null,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error',
      },
    });
  }
});

/**
 * Start HTTP server
 */
app.listen(PORT, () => {
  console.log(`Finance MCP Server running on http://localhost:${PORT}`);
  console.log(`Available tools: ${tools.map((t) => t.name).join(', ')}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Tools list: http://localhost:${PORT}/tools`);
});

/**
 * Start MCP server with stdio transport (for Grafana integration)
 */
if (process.argv.includes('--stdio')) {
  const transport = new StdioServerTransport();
  server.connect(transport);
  console.log('Finance MCP Server started with stdio transport');
}

export { server, tools, toolHandlers };
