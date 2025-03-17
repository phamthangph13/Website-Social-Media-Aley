# API Documentation: Friends Service

## Overview
API Friend Service cung cấp các endpoint để quản lý quan hệ bạn bè trong hệ thống. Các chức năng bao gồm gửi, chấp nhận, huỷ lời mời kết bạn, huỷ kết bạn, lấy danh sách gợi ý bạn bè, kiểm tra trạng thái kết bạn, và quản lý lời mời kết bạn.

Tất cả các API đều yêu cầu xác thực JWT (JSON Web Token).

## Base URL
```
/api/friends
```

## Authentication
Tất cả các endpoint đều yêu cầu xác thực bằng bearer token JWT trong header Authorization:

```
Authorization: Bearer <token>
```

## Error Responses
Tất cả các API trả về cùng một định dạng lỗi:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Thông báo lỗi"
  }
}
```

## Endpoints

### 1. Lấy gợi ý bạn bè

Trả về danh sách người dùng được gợi ý để kết bạn (không bao gồm bạn bè hiện tại, người có lời mời kết bạn đang chờ xử lý, và chính người dùng).

- **URL**: `/api/friends/suggestions`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Số trang (mặc định: 1)
  - `limit`: Số lượng kết quả trên một trang (mặc định: 20)
  - `search`: Tìm kiếm theo tên (không bắt buộc)

- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "suggestions": [
        {
          "user_id": "60d5e3a5b2d7c2309c3b2a1b",
          "name": "Nguyễn Văn A",
          "avatar": "https://example.com/avatar.jpg",
          "bio": "Giới thiệu ngắn",
          "mutual_friends_count": 5
        },
        // ...
      ],
      "pagination": {
        "current_page": 1,
        "total_pages": 10,
        "total_items": 198,
        "limit": 20
      }
    }
  }
  ```

### 2. Gửi lời mời kết bạn

Gửi lời mời kết bạn tới một người dùng khác. Nếu người nhận đã gửi lời mời kết bạn cho người dùng hiện tại, hai người sẽ tự động trở thành bạn bè.

- **URL**: `/api/friends/requests`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "recipient_id": "60d5e3a5b2d7c2309c3b2a1b"
  }
  ```

- **Success Response** (Nếu tạo lời mời kết bạn mới):
  ```json
  {
    "success": true,
    "data": {
      "request_id": "60d5e3a5b2d7c2309c3b2a1c",
      "recipient": {
        "user_id": "60d5e3a5b2d7c2309c3b2a1b",
        "name": "Nguyễn Văn A",
        "avatar": "https://example.com/avatar.jpg",
        "bio": "Giới thiệu ngắn"
      },
      "status": "pending",
      "created_at": "2023-06-21T15:30:45.123Z"
    }
  }
  ```

- **Success Response** (Nếu người nhận đã gửi lời mời trước đó):
  ```json
  {
    "success": true,
    "data": {
      "friendship_id": "60d5e3a5b2d7c2309c3b2a1d",
      "friend": {
        "user_id": "60d5e3a5b2d7c2309c3b2a1b",
        "name": "Nguyễn Văn A",
        "avatar": "https://example.com/avatar.jpg",
        "bio": "Giới thiệu ngắn"
      },
      "created_at": "2023-06-21T15:30:45.123Z"
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: ID người nhận không hợp lệ, hoặc người dùng không tồn tại
  - `409 Conflict`: Đã là bạn bè hoặc đã gửi lời mời kết bạn trước đó

### 3. Huỷ lời mời kết bạn

Huỷ một lời mời kết bạn đã gửi trước đó (chỉ người gửi mới có thể huỷ).

- **URL**: `/api/friends/requests/{request_id}`
- **Method**: `DELETE`
- **URL Parameters**:
  - `request_id`: ID của lời mời kết bạn

- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Đã huỷ lời mời kết bạn"
    }
  }
  ```

- **Error Responses**:
  - `403 Forbidden`: Người dùng không có quyền huỷ lời mời này
  - `404 Not Found`: Không tìm thấy lời mời kết bạn

### 4. Huỷ kết bạn

Huỷ kết bạn với một người dùng khác.

- **URL**: `/api/friends/{friend_id}`
- **Method**: `DELETE`
- **URL Parameters**:
  - `friend_id`: ID của người bạn muốn huỷ kết bạn

- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "Đã huỷ kết bạn thành công"
    }
  }
  ```

- **Error Responses**:
  - `404 Not Found`: Mối quan hệ bạn bè không tồn tại

### 5. Chấp nhận lời mời kết bạn

Chấp nhận một lời mời kết bạn đã nhận (chỉ người nhận mới có thể chấp nhận).

- **URL**: `/api/friends/requests/{request_id}/accept`
- **Method**: `POST`
- **URL Parameters**:
  - `request_id`: ID của lời mời kết bạn

- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "friendship_id": "60d5e3a5b2d7c2309c3b2a1d",
      "friend": {
        "user_id": "60d5e3a5b2d7c2309c3b2a1b",
        "name": "Nguyễn Văn A",
        "avatar": "https://example.com/avatar.jpg",
        "bio": "Giới thiệu ngắn"
      },
      "created_at": "2023-06-21T15:30:45.123Z"
    }
  }
  ```

- **Error Responses**:
  - `403 Forbidden`: Người dùng không thể chấp nhận lời mời này
  - `404 Not Found`: Không tìm thấy lời mời kết bạn

### 6. Lấy danh sách lời mời kết bạn đã nhận

Lấy danh sách các lời mời kết bạn đã nhận và đang chờ xử lý.

- **URL**: `/api/friends/requests/received`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Số trang (mặc định: 1)
  - `limit`: Số lượng kết quả trên một trang (mặc định: 20)

- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "requests": [
        {
          "request_id": "60d5e3a5b2d7c2309c3b2a1c",
          "sender": {
            "user_id": "60d5e3a5b2d7c2309c3b2a1b",
            "name": "Nguyễn Văn A",
            "avatar": "https://example.com/avatar.jpg",
            "bio": "Giới thiệu ngắn",
            "mutual_friends_count": 3
          },
          "created_at": "2023-06-21T15:30:45.123Z"
        },
        // ...
      ],
      "pagination": {
        "current_page": 1,
        "total_pages": 2,
        "total_items": 25,
        "limit": 20
      }
    }
  }
  ```

### 7. Lấy danh sách lời mời kết bạn đã gửi

Lấy danh sách các lời mời kết bạn đã gửi và đang chờ xử lý.

- **URL**: `/api/friends/requests/sent`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: Số trang (mặc định: 1)
  - `limit`: Số lượng kết quả trên một trang (mặc định: 20)

- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "requests": [
        {
          "request_id": "60d5e3a5b2d7c2309c3b2a1c",
          "recipient": {
            "user_id": "60d5e3a5b2d7c2309c3b2a1b",
            "name": "Nguyễn Văn A",
            "avatar": "https://example.com/avatar.jpg",
            "bio": "Giới thiệu ngắn"
          },
          "created_at": "2023-06-21T15:30:45.123Z"
        },
        // ...
      ],
      "pagination": {
        "current_page": 1,
        "total_pages": 2,
        "total_items": 30,
        "limit": 20
      }
    }
  }
  ```

### 8. Kiểm tra trạng thái kết bạn

Kiểm tra trạng thái kết bạn giữa người dùng hiện tại và một người dùng khác.

- **URL**: `/api/friends/status/{user_id}`
- **Method**: `GET`
- **URL Parameters**:
  - `user_id`: ID của người dùng cần kiểm tra trạng thái

- **Success Response** (Đã là bạn bè):
  ```json
  {
    "success": true,
    "data": {
      "status": "friends",
      "user_id": "60d5e3a5b2d7c2309c3b2a1b",
      "friendship_id": "60d5e3a5b2d7c2309c3b2a1d"
    }
  }
  ```

- **Success Response** (Đã gửi lời mời kết bạn):
  ```json
  {
    "success": true,
    "data": {
      "status": "pending_sent",
      "user_id": "60d5e3a5b2d7c2309c3b2a1b",
      "request_id": "60d5e3a5b2d7c2309c3b2a1c"
    }
  }
  ```

- **Success Response** (Đã nhận lời mời kết bạn):
  ```json
  {
    "success": true,
    "data": {
      "status": "pending_received",
      "user_id": "60d5e3a5b2d7c2309c3b2a1b",
      "request_id": "60d5e3a5b2d7c2309c3b2a1c"
    }
  }
  ```

- **Success Response** (Không có mối quan hệ):
  ```json
  {
    "success": true,
    "data": {
      "status": "not_friends",
      "user_id": "60d5e3a5b2d7c2309c3b2a1b"
    }
  }
  ```

- **Error Responses**:
  - `400 Bad Request`: ID người dùng không hợp lệ hoặc đang kiểm tra với chính mình

## Lưu ý

1. Tất cả các API yêu cầu xác thực JWT thông qua Authorization header.
2. Các ID trong response là dạng chuỗi, mặc dù trong cơ sở dữ liệu MongoDB lưu dưới dạng ObjectId.
3. Mọi thao tác với bạn bè đều được lưu lịch sử với thời gian (created_at, updated_at).
4. Các endpoint liên quan đến lời mời kết bạn được xác thực quyền để đảm bảo chỉ người gửi hoặc người nhận có thể thao tác trên lời mời của họ.


<think>The user is asking about how the friend-related data is stored in collections (MongoDB collections). Let me search for information about the MongoDB collections used in the friends service.

From the code snippets I've reviewed previously, I've seen that the Friend service uses several MongoDB collections. Let me summarize what I know about them:

1. `friends` - Stores friendship relationships
2. `friend_requests` - Stores friend requests
3. `users` - Stores user information

I need to explain how data is stored in these collections, their schema, and how they relate to each other. I'll search for more details about these collections.</think>Tôi sẽ giải thích chi tiết về cách các dữ liệu liên quan đến friend service được lưu trữ trong các collection MongoDB.

## Collections Liên Quan

Dữ liệu của Friend Service được lưu trữ trong 3 collection chính:

### 1. Collection `friend_requests`

Collection này lưu trữ tất cả các lời mời kết bạn với cấu trúc:

```json
{
  "_id": ObjectId("60d5e3a5b2d7c2309c3b2a1c"),
  "sender_id": "user123",
  "recipient_id": "user456",
  "status": "pending",  // Có thể là "pending" hoặc "accepted"
  "created_at": ISODate("2023-06-21T15:30:45.123Z"),
  "updated_at": ISODate("2023-06-21T15:30:45.123Z")  // Nếu status thay đổi
}
```

Các trạng thái (`status`) có thể là:
- `pending`: Lời mời đang chờ xử lý
- `accepted`: Lời mời đã được chấp nhận (hai người đã là bạn bè)

Khi người dùng gửi lời mời kết bạn, một document mới được tạo với status là "pending". Khi người nhận chấp nhận lời mời, status được cập nhật thành "accepted".

### 2. Collection `friends`

Collection này lưu trữ các mối quan hệ bạn bè đã được thiết lập:

```json
{
  "_id": ObjectId("60d5e3a5b2d7c2309c3b2a1d"),
  "user_id": "user123",
  "friend_id": "user456",
  "status": "accepted",
  "created_at": ISODate("2023-06-21T15:30:45.123Z")
}
```

Một document mới được thêm vào collection này khi:
- Người dùng chấp nhận lời mời kết bạn
- Người dùng gửi lời mời kết bạn tới người đã gửi lời mời cho họ trước đó (tự động chấp nhận)

### 3. Collection `users`

Mặc dù không thuộc trực tiếp về Friend Service, collection này được sử dụng để lấy thông tin người dùng như tên, avatar, và bio:

```json
{
  "_id": ObjectId("60d5e3a5b2d7c2309c3b2a1b"),
  "fullName": "Nguyễn Văn A",
  "avatar": "https://example.com/avatar.jpg",
  "profile-bio": "Giới thiệu ngắn"
  // Các trường khác của user
}
```

## Các Operation Trên Collections

### Khi gửi lời mời kết bạn:
1. Kiểm tra nếu người nhận đã gửi lời mời cho người dùng hiện tại:
   ```javascript
   friend_requests.find_one({
     'sender_id': recipient_id,
     'recipient_id': current_user_id,
     'status': 'pending'
   })
   ```

2. Nếu có, cập nhật status lời mời thành "accepted" và tạo mối quan hệ bạn bè:
   ```javascript
   friend_requests.update_one(
     {'_id': existing_request['_id']},
     {'$set': {'status': 'accepted', 'updated_at': datetime.now()}}
   )
   
   friends.insert_one({
     'user_id': current_user_id,
     'friend_id': recipient_id,
     'status': 'accepted',
     'created_at': datetime.now()
   })
   ```

3. Nếu không, tạo lời mời kết bạn mới:
   ```javascript
   friend_requests.insert_one({
     'sender_id': current_user_id,
     'recipient_id': recipient_id,
     'status': 'pending',
     'created_at': datetime.now()
   })
   ```

### Khi chấp nhận lời mời kết bạn:
1. Cập nhật status lời mời thành "accepted":
   ```javascript
   friend_requests.update_one(
     {'_id': ObjectId(request_id)},
     {'$set': {'status': 'accepted', 'updated_at': datetime.now()}}
   )
   ```

### Khi huỷ kết bạn:
1. Xoá mối quan hệ bạn bè từ collection friends:
   ```javascript
   friends.delete_one({
     '$or': [
       {'user_id': current_user_id, 'friend_id': friend_id},
       {'user_id': friend_id, 'friend_id': current_user_id}
     ]
   })
   ```

2. Xoá các lời mời kết bạn đã được chấp nhận:
   ```javascript
   friend_requests.delete_many({
     '$or': [
       {'sender_id': current_user_id, 'recipient_id': friend_id, 'status': 'accepted'},
       {'sender_id': friend_id, 'recipient_id': current_user_id, 'status': 'accepted'}
     ]
   })
   ```

### Khi kiểm tra trạng thái bạn bè:
Thực hiện các truy vấn lần lượt vào collections để kiểm tra mối quan hệ:
1. Kiểm tra nếu đã là bạn bè
2. Kiểm tra nếu đã gửi lời mời
3. Kiểm tra nếu đã nhận lời mời

Mối quan hệ bạn bè được thiết kế để truy vấn hai chiều - bạn có thể tìm các bạn bè của người dùng bằng cách tìm những document trong collection "friends" mà user_id hoặc friend_id khớp với ID của người dùng đó.


<think>The user wants to know how to handle the UI display for friend relationship buttons like "Kết bạn" (Add Friend), "Huỷ lời mời" (Cancel Request), "Chấp nhận" (Accept), and "Bạn bè" (Friends) based on the friendship status.

I should explain how to determine which button to show based on the friendship status that can be retrieved from the API, specifically from the status endpoint. I need to explain the logic for when to show each button and how to handle the state changes when a button is clicked.</think># Hiển thị Button Dựa Trên Trạng Thái Bạn Bè

Để hiển thị các nút tác động đúng như [Kết bạn], [Huỷ lời mời], [Chấp nhận], và [Bạn bè], bạn cần sử dụng API kiểm tra trạng thái kết bạn để xác định mối quan hệ giữa người dùng hiện tại và người dùng mà họ đang xem.

## 1. Kiểm Tra Trạng Thái Kết Bạn

Đầu tiên, gọi API kiểm tra trạng thái:

```javascript
// Giả sử userId là ID của người dùng bạn muốn kiểm tra trạng thái
fetch(`/api/friends/status/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + yourJWTToken,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    // Xử lý hiển thị button dựa trên trạng thái
    displayFriendButton(data.data.status, data.data.request_id);
  }
})
.catch(error => console.error('Error:', error));
```

## 2. Hiển Thị Button Dựa Trên Trạng Thái

Tạo một hàm để xác định nút nào sẽ được hiển thị:

```javascript
function displayFriendButton(status, requestId) {
  // Ẩn tất cả các button trước
  document.getElementById('add-friend-btn').style.display = 'none';
  document.getElementById('cancel-request-btn').style.display = 'none';
  document.getElementById('accept-request-btn').style.display = 'none';
  document.getElementById('unfriend-btn').style.display = 'none';
  
  // Hiển thị button tương ứng với trạng thái
  switch (status) {
    case 'not_friends':
      // Hiển thị nút "Kết bạn"
      document.getElementById('add-friend-btn').style.display = 'block';
      break;
      
    case 'pending_sent':
      // Hiển thị nút "Huỷ lời mời"
      document.getElementById('cancel-request-btn').style.display = 'block';
      // Lưu request_id để dùng khi huỷ lời mời
      document.getElementById('cancel-request-btn').setAttribute('data-request-id', requestId);
      break;
      
    case 'pending_received':
      // Hiển thị nút "Chấp nhận"
      document.getElementById('accept-request-btn').style.display = 'block';
      // Lưu request_id để dùng khi chấp nhận lời mời
      document.getElementById('accept-request-btn').setAttribute('data-request-id', requestId);
      break;
      
    case 'friends':
      // Hiển thị nút "Bạn bè" (có thể là dropdown với tùy chọn "Huỷ kết bạn")
      document.getElementById('unfriend-btn').style.display = 'block';
      break;
  }
}
```

## 3. Xử Lý Sự Kiện Khi Click Button

Khi người dùng nhấn nút, bạn cần gọi API tương ứng và cập nhật UI:

### Nút "Kết bạn":

```javascript
document.getElementById('add-friend-btn').addEventListener('click', function() {
  fetch('/api/friends/requests', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + yourJWTToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipient_id: userId
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Chuyển sang trạng thái đã gửi lời mời
      displayFriendButton('pending_sent', data.data.request_id);
    }
  })
  .catch(error => console.error('Error:', error));
});
```

### Nút "Huỷ lời mời":

```javascript
document.getElementById('cancel-request-btn').addEventListener('click', function() {
  const requestId = this.getAttribute('data-request-id');
  
  fetch(`/api/friends/requests/${requestId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + yourJWTToken
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Chuyển về trạng thái không phải bạn bè
      displayFriendButton('not_friends');
    }
  })
  .catch(error => console.error('Error:', error));
});
```

### Nút "Chấp nhận":

```javascript
document.getElementById('accept-request-btn').addEventListener('click', function() {
  const requestId = this.getAttribute('data-request-id');
  
  fetch(`/api/friends/requests/${requestId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + yourJWTToken
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Chuyển sang trạng thái đã là bạn bè
      displayFriendButton('friends');
    }
  })
  .catch(error => console.error('Error:', error));
});
```

### Nút "Bạn bè" (Huỷ kết bạn):

```javascript
document.getElementById('unfriend-btn').addEventListener('click', function() {
  // Hiển thị xác nhận trước khi huỷ kết bạn
  if (confirm('Bạn có chắc muốn huỷ kết bạn?')) {
    fetch(`/api/friends/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + yourJWTToken
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Chuyển về trạng thái không phải bạn bè
        displayFriendButton('not_friends');
      }
    })
    .catch(error => console.error('Error:', error));
  }
});
```

## 5. Xử Lý UI Thông Minh

Để tạo trải nghiệm người dùng tốt hơn, bạn có thể:

- Thêm loading state để hiển thị spinner khi đang gọi API
- Sử dụng dropdown menu cho nút "Bạn bè" với các tùy chọn như "Huỷ kết bạn"
- Thêm xác nhận trước khi thực hiện các hành động như huỷ kết bạn
- Cập nhật state ngay lập tức trước khi call API để UI phản hồi nhanh chóng, sau đó hoàn tác nếu API thất bại (optimistic UI update)

Với cách tiếp cận này, giao diện người dùng sẽ luôn hiển thị đúng nút tác động dựa trên trạng thái quan hệ bạn bè hiện tại, và cập nhật UI ngay khi người dùng tương tác với nút.
