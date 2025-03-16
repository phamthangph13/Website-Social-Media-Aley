# Friend API Documentation

This document describes the API endpoints related to friend functionality.

## Authentication

All endpoints require authentication using a JWT token passed in the Authorization header:

```
Authorization: Bearer <token>
```

## API Endpoints

### 1. Send Friend Request

Sends a friend request to another user.

**Endpoint:** `POST /api/friends/requests`

**Request Body:**
```json
{
  "recipient_id": "string" // ID of the user to send request to
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "request_id": "string",
    "recipient": {
      "user_id": "string",
      "name": "string",
      "avatar": "string",
      "bio": "string" // optional
    },
    "status": "pending",
    "created_at": "datetime"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing recipient_id, invalid recipient_id
- `409 Conflict`: Already friends or request already sent
- `401 Unauthorized`: Invalid or missing token

**Notes:**
- If the recipient already sent you a request, this call will automatically accept it and return a 200 response with friendship details instead.

### 2. Cancel Friend Request

Cancels a pending friend request that you have sent.

**Endpoint:** `DELETE /api/friends/requests/:request_id`

**URL Parameters:**
- `request_id`: ID of the friend request to cancel

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Đã huỷ lời mời kết bạn"
  }
}
```

**Error Responses:**
- `404 Not Found`: Friend request not found
- `403 Forbidden`: Not authorized to cancel this request (not the sender)
- `401 Unauthorized`: Invalid or missing token

### 3. Accept Friend Request

Accepts a pending friend request that you have received.

**Endpoint:** `POST /api/friends/requests/:request_id/accept`

**URL Parameters:**
- `request_id`: ID of the friend request to accept

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "friendship_id": "string",
    "friend": {
      "user_id": "string",
      "name": "string",
      "avatar": "string",
      "bio": "string" // optional
    },
    "created_at": "datetime"
  }
}
```

**Error Responses:**
- `404 Not Found`: Friend request not found
- `403 Forbidden`: Not authorized to accept this request (not the recipient)
- `401 Unauthorized`: Invalid or missing token

### 4. Unfriend User

Removes a user from your friends list.

**Endpoint:** `DELETE /api/friends/:friend_id`

**URL Parameters:**
- `friend_id`: ID of the user to unfriend

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Đã huỷ kết bạn thành công"
  }
}
```

**Error Responses:**
- `404 Not Found`: Friendship not found
- `401 Unauthorized`: Invalid or missing token

### 5. Check Friend Status

Checks the friendship status between you and another user. This endpoint can be used to:
- Check if someone is your friend
- Check if someone sent you a friend request
- Check if you sent someone a friend request

**Endpoint:** `GET /api/friends/status/:user_id`

**URL Parameters:**
- `user_id`: ID of the user to check friendship status with

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "string", // "friends", "pending_sent", "pending_received", or "not_friends"
    "user_id": "string",
    "request_id": "string", // included if status is pending_sent or pending_received
    "friendship_id": "string" // included if status is friends
  }
}
```

**Status values:**
- `friends`: The users are friends
- `pending_sent`: Current user has sent a request to the other user
- `pending_received`: The other user has sent a request to the current user
- `not_friends`: No relationship exists between the users

**Error Responses:**
- `400 Bad Request`: Invalid user ID or trying to check status with yourself
- `401 Unauthorized`: Invalid or missing token

## Additional Endpoints

### View Received Friend Requests

**Endpoint:** `GET /api/friends/requests/received`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of results per page (default: 20)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "request_id": "string",
        "sender": {
          "user_id": "string",
          "name": "string",
          "avatar": "string",
          "bio": "string", // optional
          "mutual_friends_count": number // optional
        },
        "created_at": "datetime"
      }
    ],
    "pagination": {
      "current_page": number,
      "total_pages": number,
      "total_items": number,
      "limit": number
    }
  }
}
```

### View Sent Friend Requests

**Endpoint:** `GET /api/friends/requests/sent`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of results per page (default: 20)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "request_id": "string",
        "recipient": {
          "user_id": "string",
          "name": "string",
          "avatar": "string",
          "bio": "string" // optional
        },
        "created_at": "datetime"
      }
    ],
    "pagination": {
      "current_page": number,
      "total_pages": number,
      "total_items": number,
      "limit": number
    }
  }
}
```

### Get Friend Suggestions

**Endpoint:** `GET /api/friends/suggestions`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of results per page (default: 20)
- `search`: Search term to filter suggestions by name (optional)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "user_id": "string",
        "name": "string",
        "avatar": "string",
        "bio": "string", // optional
        "mutual_friends_count": number // optional
      }
    ],
    "pagination": {
      "current_page": number,
      "total_pages": number,
      "total_items": number,
      "limit": number
    }
  }
}
``` 