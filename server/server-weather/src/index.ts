import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3005;

const app = express();

/** Enable CORS */
app.use(cors());
app.use(express.json());

/** MCP Server setup */
const server = new Server({
  name: 'weather-mcp-server',
  version: '1.0.0',
});

/** Mock weather data */
const weatherData = {
  'Moscow': {
    temperature: 15,
    condition: 'Partly cloudy',
    humidity: 65,
    windSpeed: 12,
    pressure: 1013,
  },
  'London': {
    temperature: 8,
    condition: 'Rainy',
    humidity: 85,
    windSpeed: 18,
    pressure: 1008,
  },
  'New York': {
    temperature: 22,
    condition: 'Sunny',
    humidity: 45,
    windSpeed: 8,
    pressure: 1015,
  },
  'Tokyo': {
    temperature: 18,
    condition: 'Cloudy',
    humidity: 70,
    windSpeed: 10,
    pressure: 1010,
  },
  'Sydney': {
    temperature: 25,
    condition: 'Clear',
    humidity: 55,
    windSpeed: 15,
    pressure: 1018,
  },
};

/** Mock forecast data */
const forecastData = {
  'Moscow': [
    { date: '2024-01-01', high: 12, low: 2, condition: 'Cloudy' },
    { date: '2024-01-02', high: 15, low: 5, condition: 'Partly cloudy' },
    { date: '2024-01-03', high: 18, low: 8, condition: 'Sunny' },
  ],
  'London': [
    { date: '2024-01-01', high: 10, low: 3, condition: 'Rainy' },
    { date: '2024-01-02', high: 12, low: 5, condition: 'Cloudy' },
    { date: '2024-01-03', high: 14, low: 7, condition: 'Partly cloudy' },
  ],
};

/** Define weather tools */
const tools = [
  {
    name: 'get_current_weather',
    description: 'Get current weather information for a specific city',
    inputSchema: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name to get weather for',
        },
        units: {
          type: 'string',
          description: 'Temperature units (celsius/fahrenheit)',
          enum: ['celsius', 'fahrenheit'],
          default: 'celsius',
        },
      },
      required: ['city'],
    },
  },
  {
    name: 'get_weather_forecast',
    description: 'Get weather forecast for a specific city',
    inputSchema: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name to get forecast for',
        },
        days: {
          type: 'number',
          description: 'Number of days for forecast (1-7)',
          minimum: 1,
          maximum: 7,
          default: 3,
        },
      },
      required: ['city'],
    },
  },
  {
    name: 'get_weather_alerts',
    description: 'Get weather alerts for a specific city',
    inputSchema: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name to get alerts for',
        },
      },
      required: ['city'],
    },
  },
  {
    name: 'get_air_quality',
    description: 'Get air quality information for a specific city',
    inputSchema: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name to get air quality for',
        },
      },
      required: ['city'],
    },
  },
  {
    name: 'get_weather_statistics',
    description: 'Get weather statistics for a specific city',
    inputSchema: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name to get statistics for',
        },
        period: {
          type: 'string',
          description: 'Statistics period',
          enum: ['daily', 'weekly', 'monthly'],
          default: 'daily',
        },
      },
      required: ['city'],
    },
  },
];

/** Tool handlers */
const toolHandlers = {
  get_current_weather: async (args: any) => {
    const { city, units = 'celsius' } = args;
    
    if (!weatherData[city]) {
      throw new Error(`Weather data not available for ${city}`);
    }

    const weather = weatherData[city];
    let temperature = weather.temperature;
    
    if (units === 'fahrenheit') {
      temperature = Math.round((temperature * 9/5) + 32);
    }

    return {
      content: {
        city,
        temperature: {
          value: temperature,
          units,
        },
        condition: weather.condition,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        pressure: weather.pressure,
        timestamp: new Date().toISOString(),
      },
    };
  },

  get_weather_forecast: async (args: any) => {
    const { city, days = 3 } = args;
    
    if (!forecastData[city]) {
      throw new Error(`Forecast data not available for ${city}`);
    }

    const forecast = forecastData[city].slice(0, days);

    return {
      content: {
        city,
        forecast,
        requestedDays: days,
        timestamp: new Date().toISOString(),
      },
    };
  },

  get_weather_alerts: async (args: any) => {
    const { city } = args;
    
    /** Mock alerts based on city */
    const alerts = {
      'Moscow': [
        { type: 'wind', severity: 'moderate', message: 'Strong winds expected' },
      ],
      'London': [
        { type: 'rain', severity: 'high', message: 'Heavy rainfall warning' },
      ],
      'New York': [],
      'Tokyo': [
        { type: 'typhoon', severity: 'high', message: 'Typhoon warning in effect' },
      ],
      'Sydney': [],
    };

    return {
      content: {
        city,
        alerts: alerts[city] || [],
        timestamp: new Date().toISOString(),
      },
    };
  },

  get_air_quality: async (args: any) => {
    const { city } = args;
    
    /** Mock air quality data */
    const airQualityData = {
      'Moscow': { aqi: 45, level: 'Good', pollutants: { pm25: 12, pm10: 25, o3: 35 } },
      'London': { aqi: 65, level: 'Moderate', pollutants: { pm25: 18, pm10: 35, o3: 45 } },
      'New York': { aqi: 55, level: 'Moderate', pollutants: { pm25: 15, pm10: 30, o3: 40 } },
      'Tokyo': { aqi: 75, level: 'Moderate', pollutants: { pm25: 22, pm10: 45, o3: 55 } },
      'Sydney': { aqi: 35, level: 'Good', pollutants: { pm25: 8, pm10: 15, o3: 25 } },
    };

    if (!airQualityData[city]) {
      throw new Error(`Air quality data not available for ${city}`);
    }

    return {
      content: {
        city,
        ...airQualityData[city],
        timestamp: new Date().toISOString(),
      },
    };
  },

  get_weather_statistics: async (args: any) => {
    const { city, period = 'daily' } = args;
    
    /** Mock statistics data */
    const statsData = {
      'Moscow': {
        daily: { avgTemp: 12, maxTemp: 18, minTemp: 5, totalRainfall: 2.5 },
        weekly: { avgTemp: 11, maxTemp: 20, minTemp: 3, totalRainfall: 15.2 },
        monthly: { avgTemp: 10, maxTemp: 25, minTemp: -2, totalRainfall: 45.8 },
      },
      'London': {
        daily: { avgTemp: 8, maxTemp: 12, minTemp: 4, totalRainfall: 8.5 },
        weekly: { avgTemp: 9, maxTemp: 15, minTemp: 3, totalRainfall: 25.1 },
        monthly: { avgTemp: 8, maxTemp: 18, minTemp: 1, totalRainfall: 85.3 },
      },
    };

    if (!statsData[city]) {
      throw new Error(`Statistics data not available for ${city}`);
    }

    return {
      content: {
        city,
        period,
        statistics: statsData[city][period],
        timestamp: new Date().toISOString(),
      },
    };
  },
};

/** Register tool handlers */
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

/** Health check endpoint */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: 'weather-mcp-server',
    version: '1.0.0',
    availableTools: tools.map(t => t.name),
  });
});

/** Tools list endpoint */
app.get('/tools', (req, res) => {
  res.json({ tools });
});

/** Tool execution endpoint */
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

/** MCP protocol endpoint */
app.post('/', async (req, res) => {
  try {
    const { jsonrpc, id, method, params } = req.body;
    
    /** Validate JSON-RPC 2.0 format */
    if (jsonrpc !== '2.0' || !method) {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: id || null,
        error: {
          code: -32600,
          message: 'Invalid Request'
        }
      });
    }
    
    if (method === 'initialize') {
      /** Handle MCP initialization */
      res.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'weather-mcp-server',
            version: '1.0.0'
          }
        }
      });
    } else if (method === 'tools/list') {
      res.json({
        jsonrpc: '2.0',
        id,
        result: { tools }
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
            message: `Tool '${name}' not found`
          }
        });
      }
      
      try {
        const result = await handler(args);
        res.json({
          jsonrpc: '2.0',
          id,
          result
        });
      } catch (error) {
        res.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : 'Internal error'
          }
        });
      }
    } else if (method === 'notifications/initialized') {
      /** Handle initialization notification */
      res.json({
        jsonrpc: '2.0',
        id,
        result: {}
      });
    } else if (method === 'notifications/exit') {
      /** Handle exit notification */
      res.json({
        jsonrpc: '2.0',
        id,
        result: {}
      });
    } else {
      res.json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method not found: ${method}`
        }
      });
    }
  } catch (error) {
    res.json({
      jsonrpc: '2.0',
      id: req.body.id || null,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      }
    });
  }
});

/** Start HTTP server */
app.listen(PORT, () => {
  console.log(`Weather MCP Server running on http://localhost:${PORT}`);
  console.log(`Available tools: ${tools.map(t => t.name).join(', ')}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Tools list: http://localhost:${PORT}/tools`);
});

/** Start MCP server with stdio transport (for Grafana integration) */
if (process.argv.includes('--stdio')) {
  const transport = new StdioServerTransport();
  server.connect(transport);
  console.log('Weather MCP Server started with stdio transport');
}

export { server, tools, toolHandlers }; 