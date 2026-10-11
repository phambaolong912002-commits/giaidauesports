
```
spck-giải đấu esports
├─ admin.html
├─ dudoan.html
├─ index.html
├─ login.html
├─ profile.html
├─ register.html
├─ settings.html
├─ style.css
├─ supabase-config.js
├─ tintuc.html
├─ tournament-register.html
└─ xephangsucmanh.html

```

## Thiết lập quyền quản lý tin tức

1. Mở Supabase Dashboard của dự án và vào **SQL Editor**.
2. Chạy toàn bộ nội dung trong [`supabase-news-policies.sql`](./supabase-news-policies.sql).
3. Đăng nhập trang quản trị bằng tài khoản Supabase Auth có email `admin@gmail.com` hoặc `phambaolong912002@gmail.com`; cũng có thể gán `role = 'admin'` trong `profiles` hoặc `app_metadata`.

Khách chưa đăng nhập chỉ đọc được bài `published`. Tài khoản admin đã xác thực mới được thêm, sửa và xóa bài. Không dùng `service_role` key trong mã chạy ở trình duyệt.