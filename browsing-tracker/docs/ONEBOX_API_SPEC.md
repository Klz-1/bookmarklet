# Onebox Extension API Endpoint Specification

## Overview

This document specifies the API endpoint required for the Browsing Tracker Chrome extension to sync data to Onebox. The extension sends browsing history and Twitter bookmarks to Onebox for cloud storage and semantic search.

---

## Endpoint

### `POST /api/extension/ingest`

Ingests items from the Chrome extension into the user's Onebox knowledge base.

### Authentication

- **Method**: Bearer Token (Firebase ID Token)
- **Header**: `Authorization: Bearer <firebase_id_token>`

The token is obtained via Chrome's `chrome.identity.getAuthToken()` which uses Google OAuth. The backend should verify this token with Firebase Admin SDK.

### Request

```typescript
interface IngestRequest {
  items: ExtensionItem[]
}

interface ExtensionItem {
  type: 'visit' | 'twitter_bookmark'
  sourceUrl: string
  title: string
  content?: string  // Tweet text for twitter_bookmark
  metadata: Record<string, unknown>
  timestamp: string  // ISO 8601
}
```

#### Example Request Body

```json
{
  "items": [
    {
      "type": "twitter_bookmark",
      "sourceUrl": "https://twitter.com/user/status/123456789",
      "title": "@elonmusk",
      "content": "This is the tweet content that was bookmarked...",
      "metadata": {
        "tweetId": "123456789",
        "authorHandle": "elonmusk",
        "authorName": "Elon Musk",
        "authorAvatar": "https://pbs.twimg.com/...",
        "mediaUrls": ["https://pbs.twimg.com/media/..."],
        "likes": "1.2K",
        "retweets": "500",
        "replies": "2.3K"
      },
      "timestamp": "2025-01-15T10:30:00Z"
    },
    {
      "type": "visit",
      "sourceUrl": "https://example.com/article",
      "title": "Interesting Article Title",
      "metadata": {
        "domain": "example.com",
        "duration": 120,
        "favicon": "https://example.com/favicon.ico",
        "isBookmarked": false
      },
      "timestamp": "2025-01-15T11:00:00Z"
    }
  ]
}
```

### Response

#### Success (200 OK)

```json
{
  "success": true,
  "synced": 2,
  "items": [
    { "id": "abc123", "status": "created" },
    { "id": "def456", "status": "created" }
  ]
}
```

#### Duplicate Handling (200 OK)

```json
{
  "success": true,
  "synced": 1,
  "items": [
    { "id": "abc123", "status": "exists" },
    { "id": "def456", "status": "created" }
  ]
}
```

#### Error (400 Bad Request)

```json
{
  "error": "Invalid request",
  "details": [
    { "field": "items[0].sourceUrl", "message": "Invalid URL format" }
  ]
}
```

#### Error (401 Unauthorized)

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

#### Error (500 Internal Server Error)

```json
{
  "error": "Ingestion failed",
  "message": "Database connection error"
}
```

---

### `GET /api/extension/ingest`

Health check endpoint to verify connection and authentication.

### Response (200 OK)

```json
{
  "status": "ok",
  "service": "extension-ingest",
  "user": {
    "id": "user123",
    "email": "user@example.com"
  }
}
```

---

## Implementation Details

### 1. Token Verification

```typescript
import { getAuth } from 'firebase-admin/auth'

async function verifyToken(authHeader: string): Promise<DecodedIdToken | null> {
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    return await getAuth().verifyIdToken(token)
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}
```

### 2. Item Processing

For each item:

1. **Check for duplicates** by `sourceUrl` + `userId`
2. **Create KnowledgeItem** in Firestore with:
   - `type`: `'link'` (for visits) or `'link'` with `sourcePlatform: 'twitter'` (for bookmarks)
   - `sourceUrl`: from request
   - `title`: from request
   - `description`: `content` field (for tweets)
   - `userTags`: `['extension-sync', type]`
   - `processingStatus`: `'pending'` (to trigger AI analysis later)
   - `readStatus`: `'unread'`
   - `createdAt`: server timestamp
   - `platformMetadata`: `metadata` from request

3. **Queue for AI processing** (optional - can be done async)
   - Generate embeddings
   - Extract summary/insights

### 3. Suggested Firestore Structure

```typescript
// Collection: items/{itemId}
{
  id: string,
  userId: string,
  type: 'link',
  sourceUrl: string,
  sourcePlatform: 'twitter' | 'article' | 'other',
  title: string,
  description: string,  // Tweet content

  // Extension-specific
  extensionSync: {
    source: 'browsing-tracker',
    syncedAt: Timestamp,
    originalType: 'visit' | 'twitter_bookmark',
    metadata: Record<string, unknown>
  },

  // Standard fields
  userTags: string[],
  processingStatus: 'pending' | 'processing' | 'ready',
  readStatus: 'unread',
  createdAt: Timestamp,
  isPublic: false
}
```

---

## Rate Limiting

- **Recommended**: 100 items per request
- **Max**: 500 items per request
- **Throttle**: 10 requests per minute per user

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request body or validation error |
| 401 | Missing or invalid authentication token |
| 403 | User not authorized for this operation |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Testing

### cURL Example

```bash
# Get a test token first (from extension or Firebase console)
TOKEN="your_firebase_id_token"

# Test health check
curl -X GET "https://your-onebox-url/api/extension/ingest" \
  -H "Authorization: Bearer $TOKEN"

# Test ingestion
curl -X POST "https://your-onebox-url/api/extension/ingest" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "type": "twitter_bookmark",
      "sourceUrl": "https://twitter.com/test/status/123",
      "title": "@test",
      "content": "Test tweet content",
      "metadata": {
        "tweetId": "123",
        "authorHandle": "test"
      },
      "timestamp": "2025-01-15T10:00:00Z"
    }]
  }'
```

---

## Extension Configuration

The extension allows users to configure:

- **Onebox URL**: Default `https://onebox.run.app`
- **Sync interval**: 5, 10, 15, 30, or 60 minutes
- **What to sync**: Twitter bookmarks, browsing history, or both

---

## Questions for Developer

1. Should duplicates be silently skipped or should we update existing items?
2. Should we trigger AI processing immediately or queue it?
3. Do we need a separate endpoint for deleting synced items?
4. Should we support batch delete for unsyncing?
