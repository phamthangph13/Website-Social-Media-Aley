# Tài liệu API

## Thông tin chung

- **Phiên bản API**: 1.0
- **Base URL**: `/api`
- **Format dữ liệu**: JSON
- **Documentation URL**: `/` (Swagger UI)

## Yêu cầu hệ thống

| Phụ thuộc | Phiên bản |
|-----------|-----------|
| flask | 2.3.3 |
| flask-restx | 1.1.0 |
| pymongo | 4.5.0 |
| python-dotenv | 1.0.0 |
| flask-mail | 0.9.1 |
| bcrypt | 4.0.1 |
| python-jose | 3.3.0 |

## Cơ sở dữ liệu

- **MongoDB**
- **URL mặc định**: `mongodb://localhost:27017/Aley`

## Xác thực

API sử dụng JWT (JSON Web Token) để xác thực. Token được gửi qua header `Authorization` theo định dạng:

```
Authorization: Bearer [token]
```

hoặc

```
Authorization: [token]
```

## Endpoints API

### Authentication API

#### Đăng ký tài khoản

- **URL**: `/api/auth/register`
- **Method**: POST
- **Yêu cầu xác thực**: Không
- **Yêu cầu**: Người dùng phải từ 18 tuổi trở lên để đăng ký tài khoản
- **Thân yêu cầu**:

```json
{
  "fullName": "string",
  "dateOfBirth": "date",
  "email": "string",
  "password": "string"
}
```

- **Phản hồi thành công**:

```json
{
  "message": "Registration successful. Please check your email to verify your account."
}
```

- **Mã trạng thái**: 201
- **Phản hồi lỗi**:

```json
{
  "message": "Email already registered"
}
```

- **Mã trạng thái**: 400

hoặc

```json
{
  "message": "Bạn chưa đủ 18 tuổi để đăng ký tài khoản"
}
```

- **Mã trạng thái**: 400

hoặc

```json
{
  "message": "Định dạng ngày sinh không hợp lệ"
}
```

- **Mã trạng thái**: 400

#### Đăng nhập

- **URL**: `/api/auth/login`
- **Method**: POST
- **Yêu cầu xác thực**: Không
- **Thân yêu cầu**:

```json
{
  "email": "string",
  "password": "string"
}
```

- **Phản hồi thành công**:

```json
{
  "token": "string"
}
```

- **Mã trạng thái**: 200
- **Phản hồi lỗi**:

```json
{
  "message": "Invalid email or password"
}
```

- **Mã trạng thái**: 401

hoặc

```json
{
  "message": "Please verify your email first"
}
```

- **Mã trạng thái**: 401

#### Xác thực email

- **URL**: `/api/auth/verify/<token>`
- **Method**: GET
- **Yêu cầu xác thực**: Không
- **Tham số đường dẫn**:
  - `token`: Token xác thực nhận từ email

- **Phản hồi thành công**:

```json
{
  "message": "Email verified successfully"
}
```

- **Mã trạng thái**: 200
- **Phản hồi lỗi**:

```json
{
  "message": "Liên kết xác thực đã hết hạn. Link xác minh danh tính tài khoản chỉ có hiệu lực trong 24 giờ."
}
```

- **Mã trạng thái**: 400

hoặc

```json
{
  "message": "Liên kết xác thực không hợp lệ"
}
```

- **Mã trạng thái**: 400

#### Kết quả xác thực

- **URL**: `/api/auth/verify-result/<status>`
- **Method**: GET
- **Yêu cầu xác thực**: Không
- **Tham số đường dẫn**:
  - `status`: Trạng thái xác thực (`success` hoặc `error`)
- **Tham số truy vấn** (khi status là `error`):
  - `error`: Thông điệp lỗi

- **Phản hồi**: Trang HTML hiển thị kết quả xác thực
- **Mã trạng thái**: 200 hoặc 400

#### Quên mật khẩu

- **URL**: `/api/auth/forgot-password`
- **Method**: POST
- **Yêu cầu xác thực**: Không
- **Thân yêu cầu**:

```json
{
  "email": "string"
}
```

- **Phản hồi thành công**:

```json
{
  "message": "Password reset instructions sent to your email"
}
```

- **Mã trạng thái**: 200
- **Phản hồi lỗi**:

```json
{
  "message": "Email not found"
}
```

- **Mã trạng thái**: 404

#### Đặt lại mật khẩu (Xác thực token)

- **URL**: `/api/auth/reset-password/<token>`
- **Method**: GET
- **Yêu cầu xác thực**: Không
- **Tham số đường dẫn**:
  - `token`: Token xác thực nhận từ email

- **Phản hồi**: Chuyển hướng đến trang đặt lại mật khẩu `/reset-password?token=<token>`
- **Phản hồi lỗi**: Trang HTML hiển thị lỗi
- **Mã trạng thái**: 400

#### Đặt lại mật khẩu (Thiết lập mật khẩu mới)

- **URL**: `/api/auth/reset-password/<token>`
- **Method**: POST
- **Yêu cầu xác thực**: Không
- **Tham số đường dẫn**:
  - `token`: Token xác thực nhận từ email
- **Thân yêu cầu**:

```json
{
  "password": "string"
}
```

- **Phản hồi thành công**:

```json
{
  "message": "Password reset successfully"
}
```

- **Mã trạng thái**: 200
- **Phản hồi lỗi**:

```json
{
  "message": "Liên kết đặt lại mật khẩu đã hết hạn. Link đặt lại mật khẩu chỉ có hiệu lực trong 24 giờ."
}
```

- **Mã trạng thái**: 400

hoặc

```json
{
  "message": "Liên kết đặt lại mật khẩu không hợp lệ"
}
```

- **Mã trạng thái**: 400

hoặc

```json
{
  "message": "Liên kết đặt lại mật khẩu này đã được sử dụng. Vui lòng yêu cầu link mới."
}
```

- **Mã trạng thái**: 400

#### Kết quả đặt lại mật khẩu

- **URL**: `/api/auth/reset-result/<status>`
- **Method**: GET
- **Yêu cầu xác thực**: Không
- **Tham số đường dẫn**:
  - `status`: Trạng thái đặt lại mật khẩu (`success` hoặc `error`)
- **Tham số truy vấn** (khi status là `error`):
  - `error`: Thông điệp lỗi

- **Phản hồi**: Trang HTML hiển thị kết quả đặt lại mật khẩu
- **Mã trạng thái**: 200 hoặc 400

### User API

#### Lấy thông tin người dùng hiện tại

- **URL**: `/api/users/me`
- **Method**: GET
- **Yêu cầu xác thực**: Có
- **Phản hồi thành công**:

```json
{
  "fullName": "string",
  "email": "string",
  "dateOfBirth": "string",
  "avatar": "string",
  "background": "string",
  "verifiedTick": boolean
}
```

- **Mã trạng thái**: 200
- **Phản hồi lỗi**:

```json
{
  "message": "User not found"
}
```

- **Mã trạng thái**: 404

hoặc

```json
{
  "message": "Token is missing"
}
```

- **Mã trạng thái**: 401

hoặc

```json
{
  "message": "Token has expired"
}
```

- **Mã trạng thái**: 401

hoặc

```json
{
  "message": "Invalid token"
}
```

- **Mã trạng thái**: 401

#### Lấy thông tin người dùng theo ID

- **URL**: `/api/users/<user_id>`
- **Method**: GET
- **Yêu cầu xác thực**: Không
- **Tham số đường dẫn**:
  - `user_id`: ID của người dùng

- **Phản hồi thành công**:

```json
{
  "fullName": "string",
  "email": "string",
  "dateOfBirth": "string",
  "avatar": "string",
  "background": "string",
  "verifiedTick": boolean
}
```

- **Mã trạng thái**: 200
- **Phản hồi lỗi**:

```json
{
  "message": "User not found"
}
```

- **Mã trạng thái**: 404

hoặc

```json
{
  "message": "Invalid user ID: ..."
}
```

- **Mã trạng thái**: 400

#### Cập nhật thông tin người dùng

- **URL**: `/api/users/update`
- **Method**: PUT
- **Yêu cầu xác thực**: Có
- **Thân yêu cầu**:

```json
{
  "fullName": "string",        // tùy chọn
  "dateOfBirth": "string",     // tùy chọn
  "avatar": "string",          // tùy chọn
  "background": "string"       // tùy chọn
}
```

- **Phản hồi thành công**:

```json
{
  "message": "User updated successfully"
}
```

- **Mã trạng thái**: 200
- **Phản hồi lỗi**:

```json
{
  "message": "No valid fields to update"
}
```

- **Mã trạng thái**: 400

hoặc

```json
{
  "message": "Token is missing"
}
```

- **Mã trạng thái**: 401

hoặc

```json
{
  "message": "Token has expired"
}
```

- **Mã trạng thái**: 401

hoặc

```json
{
  "message": "Invalid token"
}
```

- **Mã trạng thái**: 401

#### Lấy danh sách người dùng (phân trang)

- **URL**: `/api/users/list`
- **Method**: GET
- **Yêu cầu xác thực**: Không
- **Tham số truy vấn**:
  - `page`: Số trang (mặc định: 1)
  - `limit`: Số lượng người dùng trên mỗi trang (mặc định: 10)

- **Phản hồi thành công**:

```json
{
  "users": [
    {
      "_id": "string",
      "fullName": "string",
      "email": "string",
      "dateOfBirth": "string",
      "avatar": "string",
      "background": "string",
      "verifiedTick": boolean,
      "isVerified": boolean,
      "created_at": "string"
    }
  ],
  "total": number,
  "page": number,
  "limit": number,
  "pages": number
}
```

- **Mã trạng thái**: 200

#### Tìm kiếm người dùng

- **URL**: `/api/users/search`
- **Method**: GET
- **Yêu cầu xác thực**: Không
- **Tham số truy vấn**:
  - `query`: Chuỗi tìm kiếm
  - `page`: Số trang (mặc định: 1)
  - `limit`: Số lượng người dùng trên mỗi trang (mặc định: 10)

- **Phản hồi thành công**:

```json
{
  "users": [
    {
      "_id": "string",
      "fullName": "string",
      "email": "string",
      "dateOfBirth": "string",
      "avatar": "string",
      "background": "string",
      "verifiedTick": boolean,
      "isVerified": boolean,
      "created_at": "string"
    }
  ],
  "total": number,
  "page": number,
  "limit": number,
  "pages": number
}
```

- **Mã trạng thái**: 200

## Quản lý lỗi

API sử dụng mã trạng thái HTTP chuẩn để chỉ ra kết quả của một yêu cầu:

- **200**: OK - Yêu cầu thành công
- **201**: Created - Tài nguyên đã được tạo thành công
- **400**: Bad Request - Yêu cầu không hợp lệ
- **401**: Unauthorized - Yêu cầu cần xác thực
- **404**: Not Found - Tài nguyên không tìm thấy
- **500**: Internal Server Error - Lỗi máy chủ

## Bảo mật

- API sử dụng JWT để bảo vệ các endpoint yêu cầu xác thực
- Token JWT hết hạn sau 1 giờ
- Password được mã hóa bằng bcrypt trước khi lưu vào cơ sở dữ liệu
- Các token reset mật khẩu hết hạn sau 24 giờ và chỉ có thể sử dụng một lần

## Tính năng email

API sử dụng Flask-Mail để gửi email:
- Email xác thực tài khoản sau khi đăng ký
- Email đặt lại mật khẩu

## Lưu ý triển khai

- Cơ sở dữ liệu MongoDB cần được cài đặt và chạy trên máy chủ
- Các biến môi trường có thể được cấu hình trong file config.py
- SMTP server cần được cấu hình đúng để gửi email 