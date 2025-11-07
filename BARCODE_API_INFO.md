# Barcode Lookup API Information

## Overview

This project uses the **Barcodes Lookup API** from **RapidAPI** for barcode scanning functionality.

## API Details

- **Provider**: RapidAPI
- **Service Name**: Barcodes Lookup
- **API Host**: `barcodes-lookup.p.rapidapi.com`
- **Endpoint URL**: `https://barcodes-lookup.p.rapidapi.com/?query={barcode}`
- **Documentation**: [RapidAPI Barcodes Lookup](https://rapidapi.com/barcodes-lookup/api/barcodes-lookup)

## Implementation

### Backend Integration

The barcode lookup is implemented in the backend at:
- **File**: `/server/routes/barcodes/index.js`
- **Route**: `GET /api/barcodes/lookup`
- **Query Parameter**: `barcode` - The barcode number to lookup

### Authentication

The API requires authentication through RapidAPI headers:
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

### Frontend Integration

The barcode scanner is integrated in:
- **Component**: `/src/components/LendFormGames.tsx`
- **Scanner Component**: `/src/components/BarcodeScanner.tsx`

When a barcode is scanned, the frontend calls the backend endpoint which then queries the RapidAPI service to retrieve the product title.

## API Response

The API returns product information including the title:
```json
{
    "product": {
        "title": "Product Name"
    }
}
```

## Usage Flow

1. User scans a barcode using the `BarcodeScanner` component
2. Frontend sends barcode to backend endpoint `/api/barcodes/lookup?barcode={code}`
3. Backend queries RapidAPI Barcodes Lookup service
4. Backend returns product title to frontend
5. Frontend uses the title to search for matching games

## Error Handling

- Returns 400 if barcode parameter is missing
- Returns 404 if no product title is found
- Returns 500 for internal server errors
