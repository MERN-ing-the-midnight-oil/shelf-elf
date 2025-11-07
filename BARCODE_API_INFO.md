# Barcode Lookup API Information

## Overview

This project uses **two barcode lookup APIs** with a fallback mechanism:
1. **Primary**: Barcodes Lookup API from RapidAPI
2. **Fallback**: GameUPC API

If the primary API doesn't find a result, the system automatically tries the GameUPC API as a fallback.

## API Details

### Primary API: RapidAPI Barcodes Lookup

- **Provider**: RapidAPI
- **Service Name**: Barcodes Lookup
- **API Host**: `barcodes-lookup.p.rapidapi.com`
- **Endpoint URL**: `https://barcodes-lookup.p.rapidapi.com/?query={barcode}`
- **Documentation**: [RapidAPI Barcodes Lookup](https://rapidapi.com/barcodes-lookup/api/barcodes-lookup)
- **Authentication**: Requires API key

### Fallback API: GameUPC

- **Provider**: GameUPC (gameupc.com)
- **Endpoint URL**: `https://api.gameupc.com/test/upc/{barcode}`
- **Documentation**: [GameUPC API](https://gameupc.com/)
- **Authentication**: No authentication required (public API)
- **Special Features**: Returns BoardGameGeek (BGG) information directly for board games

## Implementation

### Backend Integration

The barcode lookup is implemented in the backend at:
- **File**: `/server/routes/barcodes/index.js`
- **Route**: `GET /api/barcodes/lookup`
- **Query Parameter**: `barcode` - The barcode number to lookup

### Authentication

Only the RapidAPI requires authentication through headers:
```javascript
headers: {
    "x-rapidapi-host": "barcodes-lookup.p.rapidapi.com",
    "x-rapidapi-key": process.env.BARCODE_LOOKUP_API_KEY
}
```

### Environment Variable

Set the following environment variable in your `.env` file:
```
BARCODE_LOOKUP_API_KEY=your_rapidapi_key_here
```

Note: GameUPC does not require an API key.

### Frontend Integration

The barcode scanner is integrated in:
- **Component**: `/src/components/LendFormGames.tsx`
- **Scanner Component**: `/src/components/BarcodeScanner.tsx`

When a barcode is scanned, the frontend calls the backend endpoint which tries the RapidAPI service first, then falls back to GameUPC if needed.

## API Responses

### RapidAPI Response
```json
{
    "product": {
        "title": "Product Name"
    }
}
```

### GameUPC Response
```json
{
    "status": "ok",
    "upc": "019962194719",
    "name": "Gloomhaven",
    "bgg_info_status": "verified",
    "bgg_info": [...]
}
```

## Usage Flow

1. User scans a barcode using the `BarcodeScanner` component
2. Frontend sends barcode to backend endpoint `/api/barcodes/lookup?barcode={code}`
3. Backend queries RapidAPI Barcodes Lookup service first
4. If RapidAPI doesn't find a result, backend queries GameUPC API as fallback
5. Backend returns product title to frontend
6. Frontend uses the title to search for matching games

## Error Handling

- Returns 400 if barcode parameter is missing
- Returns 404 if no product title is found in either API
- Returns 500 for internal server errors
- Automatically falls back to GameUPC if RapidAPI fails or returns no result
