# Test 1
## I. Hướng dẫn thiết lập tài khoản
### 1. Thiết lập tài khoản Jotform và lấy API Key
- Đăng nhập: Truy cập vào Jotform và đăng nhập vào tài khoản được mời.
- Truy cập Cài đặt: Nhấp vào ảnh đại diện ở góc trên cùng bên phải và chọn Settings.
- Mở tab API: Ở menu bên trái, tìm và chọn mục API.
- Tạo Key mới: Nhấn vào nút Create New Key.
- Cấp quyền: Tại cột Permissions, chuyển trạng thái từ Read Access thành Full Access để đảm bảo ứng dụng có thể truy xuất dữ liệu đầy đủ.
- Lưu trữ: Sao chép mã API Key dán vào JOTFORM_API_KEY trong  file .env
### 2. Thiết lập Webhook trên Bitrix24
- Truy cập Developer Resources: Trên thanh menu trái của Bitrix24, tìm mục Developer Resources (hoặc gõ "Webhook" vào thanh tìm kiếm).
- Chọn loại Webhook: Chọn mục Other -> Inbound Webhook.
- Cấu hình quyền: Tại phần Assign permissions, tìm và chọn quyền CRM (crm).
- Lấy URL: Hệ thống sẽ cung cấp một đường dẫn (Webhook URL). Hãy thêm phương thức crm.contact.add vào cuối URL.
- Ví dụ: https://b24-qg8212.bitrix24.vn/rest/1/3gt5z39okcf6zkt4/crm.contact.add dán vào BITRIX_WEBHOOK_URL trong file .env
## II. Hướng dẫn thiết lập biểu mẫu Jotform
Để ứng dụng có thể lấy dữ liệu chính xác, biểu mẫu trên Jotform cần được cấu hình đúng các trường và tên định danh (Unique Name).
- Tạo Form: Nhấn Create Form -> Start From Scratch -> Classic Form.
- Thêm các trường bắt buộc:
  
  Full Name: Kéo trường Short Text vào biểu mẫu.

  Phone: Kéo trường Phone vào biểu mẫu.

  Email: Kéo trường Email vào biểu mẫu.

- Cấu hình Unique Name (Quan trọng):

  Chuột phải vào từng trường -> chọn Properties.

  Chọn tab Advanced, kéo xuống mục Field Details.

  Đổi nội dung trong ô Unique Name lần lượt thành:

  Trường Họ tên: fullname

  Trường Số điện thoại: phoneNumber

  Trường Email: email (Lưu ý: Ứng dụng sẽ tìm dữ liệu dựa trên các tên này).

- Lấy JOTFORM_FORM_ID:

  Trong link của form ví dụ : https://form.jotform.com/253501318018044 thì 253501318018044 là giá trị của JOTFORM_FORM_ID dán vào JOTFORM_FORM_ID trong file .env

## III. Hướng dẫn Triển khai Ứng dụng
### 1. Cài đặt môi trường
Đảm bảo máy tính của bạn đã cài đặt Node.js và npm.
### 2. Các bước thực hiện
- Clone repository:
  git clone <link-repository-cua-ban>
  cd test1
- Cài đặt thư viện (Dependencies):
  npm install
- Cấu hình biến môi trường:Tạo file .env trong thư mục gốc của dự án và dán cấu hình sau:

 JOTFORM_API_KEY=2108afa38a0d23711195a2617b7ed364

 JOTFORM_FORM_ID=253501318018044

 BITRIX_WEBHOOK_URL=https://b24-qg8212.bitrix24.vn/rest/1/3gt5z39okcf6zkt4/crm.contact.add

 CHECK_INTERVAL=10000
- Chạy ứng dụng:
 node index.js
## IV. Chi tiết kỹ thuật
### 1. Cấu trúc Mapping dữ liệu
 Dữ liệu từ Jotform được ánh xạ sang Bitrix24 theo quy tắc:
- Trường Full Name (fullname) -> NAME trong Bitrix24.
- Trường Phone Number (phoneNumber) -> PHONE trong Bitrix24.
- Trường Email (email) -> EMAIL trong Bitrix24.
### 2. Tính năng nổi bật
- Xử lý Logic: Sử dụng lastProcessedId để đảm bảo mỗi submission chỉ được gửi sang Bitrix24 một lần duy nhất, tránh trùng lặp dữ liệu.
- Logging: Ghi log chi tiết thời gian thực (Timestamp) cho các sự kiện: Phát hiện dữ liệu mới, Gửi thành công, hoặc Lỗi kết nối.
  
  [SUCCESS]: Khi đồng bộ thành công.

  [ERROR]: Khi có lỗi kết nối hoặc sai thông tin API.

  [INFO]: Khi đang kiểm tra hoặc không có dữ liệu mới.
  
- Clean Code: Mã nguồn được module hóa với các hàm helper như getFieldValue giúp dễ dàng bảo trì và mở rộng trường dữ liệu sau này.
### 3. Danh sách thư viện sử dụng
- axios: Thực hiện các HTTP request đến API của Jotform và Bitrix24.
- dotenv: Quản lý các thông tin bảo mật qua biến môi trường.

## V. Test
- Điền thông tin vào form https://form.jotform.com/253501318018044
 <img width="843" height="856" alt="{293ABB36-41C6-445F-BE31-D9230976F55F}" src="https://github.com/user-attachments/assets/6ff601a8-dbea-4f4a-978c-9c2becfc466d" />\
- Vào Bitrix24 chọn CRM -> Customers -> Contacts sẽ thấy thông tin được thêm thành công như ảnh:
 <img width="1889" height="899" alt="{A9E7DCED-A40D-43B3-9A4F-C8C8AC2F7D25}" src="https://github.com/user-attachments/assets/61e03fa8-b03d-4eba-8fa7-f8fdde8abcbc" />

