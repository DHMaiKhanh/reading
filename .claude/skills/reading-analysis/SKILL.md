---
name: reading-analysis
description: Dịch bài đọc tiếng Anh sang tiếng Việt theo từng đoạn + phân tích từ vựng chi tiết, xuất ra file HTML đúng định dạng của thư mục này. Use to translate an English reading passage paragraph-by-paragraph into Vietnamese and build a detailed bilingual vocabulary analysis HTML (like Art_Reading_Vocabulary_Detailed.html). Triggers: "dịch bài đọc", "phân tích từ vựng", "dịch từng đoạn", "translate passage", "vocabulary analysis".
---

# Reading Analysis — dịch bài đọc & phân tích từ vựng chi tiết

Mục tiêu: nhận một **bài đọc tiếng Anh** và tạo ra một file HTML học tập song
ngữ theo đúng "house style" của thư mục này — mỗi đoạn gồm: (1) nguyên văn
tiếng Anh, (2) bản dịch tiếng Việt đầy đủ, (3) danh sách từ vựng/cụm từ chi
tiết được đánh số liên tục.

File mẫu chuẩn để bắt chước: [Art_Reading_Vocabulary_Detailed.html](Art_Reading_Vocabulary_Detailed.html).
Tất cả đường dẫn dưới đây tính từ thư mục gốc: `d:\English\Reading_Vocabulary`.

## Quy trình (làm theo đúng thứ tự)

1. **Nhận bài đọc** từ người dùng (dán văn bản, hoặc một file). Nếu bài chia
   sẵn theo số (vd 1.1, 1.7) thì giữ nguyên cách chia; nếu không, tự chia
   theo từng **đoạn văn** (paragraph).
2. **Tạo file HTML mới** `<Tên_Bài>_Vocabulary_Detailed.html` từ template bên
   dưới. Đừng sửa đè file mẫu trừ khi người dùng yêu cầu.
3. Với **mỗi đoạn**: chép nguyên văn tiếng Anh vào `.en`, viết bản dịch
   tiếng Việt tự nhiên (không dịch word-by-word) vào `.vi`, rồi liệt kê từ
   vựng (xem "Quy tắc mục từ vựng").
4. **Đánh số từ vựng liên tục toàn bài** (1, 2, 3 … không reset ở mỗi đoạn).
5. Nếu bài có câu hỏi trắc nghiệm: thêm mục `BONUS: Đáp án & giải thích`
   (dùng `<div class="ans">`) và `BONUS: Mẹo nhận dạng dạng câu hỏi`
   (`<div class="tip">`) như trong file mẫu.
6. **Render để kiểm tra** bằng skill `run-reading-vocabulary` (xem cuối). Mở
   ảnh PNG ra xem — nếu trắng hoặc lỗi font/bảng thì sửa lại.

## Quy tắc mục từ vựng (rất quan trọng — đây là phần "chi tiết")

Mỗi mục là một `<p class="entry">` theo đúng khuôn:

```html
<p class="entry"><span class="w">N. word</span> (đọc-kiểu-việt) /IPA/ (loại từ): nghĩa tiếng Việt.<br>
<span class="ex">Example: <câu gốc trong bài, in đậm từ đang xét bằng &lt;b&gt;>.</span><br>
<span class="exvi"><dịch tiếng Việt của câu ví dụ đó>.</span></p>
```

- **N** = số thứ tự liên tục.
- **(đọc-kiểu-việt)** = gợi ý phát âm phỏng theo tiếng Việt, ví dụ
  `primarily → (rai mé rơ ly)`, `perception → (pơ sép sần)`. Giúp người học
  đọc nhanh.
- **/IPA/** = phiên âm quốc tế chuẩn. Với **cụm từ / collocation / idiom**
  thì thường **bỏ IPA** (vd mục `in other words`, `take in information`).
- **(loại từ)** = `(v)`, `(n)`, `(adj)`, `(adv)`, `(prep)`… Cụm từ có thể bỏ.
- **Example** = lấy **đúng câu trong bài đọc** chứa từ đó, in đậm từ/cụm bằng
  `<b>…</b>`. Không bịa câu mới.
- **exvi** = dịch tiếng Việt của riêng câu ví dụ.
- Khi một từ/cụm cần giải thích thêm (ngữ pháp, sắc thái), thêm một khối
  `<div class="expl"><b>Explain:</b> …</div>` ngay sau mục đó (xem mục số 9
  trong file mẫu).
- Thứ tự liệt kê: **từ đơn trước** (theo thứ tự xuất hiện trong đoạn), rồi
  **cụm từ / collocation** sau.

## Template HTML (copy nguyên khối <head> này để đồng bộ giao diện)

```html
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>TÊN BÀI - Phân tích từ vựng chi tiết</title>
<style>
body { font-family: 'Calibri', sans-serif; font-size: 12pt; line-height: 1.45; color: #222; }
h1 { color: #1F4E79; font-size: 20pt; text-align: center; }
h2 { color: #2E74B5; font-size: 15pt; border-bottom: 2px solid #2E74B5; padding-bottom: 3px; margin-top: 24px; }
.en { background: #F2F7FF; padding: 8px 12px; border-left: 4px solid #2E74B5; font-style: italic; }
.vi { background: #FFF8E7; padding: 8px 12px; border-left: 4px solid #E0A800; margin-bottom: 10px; }
.entry { margin: 9px 0; }
.w { font-weight: bold; color: #1F4E79; font-size: 12.5pt; }
.ex { color: #444; font-style: italic; }
.exvi { color: #7a5c00; }
.expl { background:#EFEFEF; border-left:3px solid #888; padding:6px 10px; margin:4px 0 4px 16px; font-size:11pt;}
.ans { background: #FDECEA; border-left: 4px solid #C00000; padding: 8px 12px; }
.tip { background: #EAF7EA; border-left: 4px solid #28A745; padding: 8px 12px; }
.note { color:#555; font-size: 10.5pt; font-style: italic; }
hr { border:none; border-top:1px dashed #bbb; margin:6px 0;}
</style>
</head>
<body>

<h1>TÊN BÀI<br>Phân tích từ vựng chi tiết</h1>
<p class="note" style="text-align:center;">Định dạng: Số → Từ (cách đọc) /IPA/ (loại từ): nghĩa → Example (Anh – Việt)</p>

<!-- ====== lặp lại khối này cho mỗi đoạn ====== -->
<h2>Passage 1.1</h2>
<p class="en">…câu tiếng Anh nguyên văn…</p>
<p class="vi">…bản dịch tiếng Việt…</p>

<p class="entry"><span class="w">1. word</span> (đọc-kiểu-việt) /IPA/ (loại từ): nghĩa.<br>
<span class="ex">Example: …<b>word</b>…</span><br>
<span class="exvi">…dịch ví dụ…</span></p>
<!-- ====== hết khối đoạn ====== -->

</body>
</html>
```

## Render & kiểm tra (bắt buộc trước khi báo "xong")

Dùng driver của skill `run-reading-vocabulary` để chụp ảnh toàn trang:

```powershell
node ".\.claude\skills\run-reading-vocabulary\driver.mjs" ".\TÊN_FILE.html" ".\.claude\skills\run-reading-vocabulary\render-check.png"
```

Sau đó **mở `render-check.png` xem** để chắc chắn: tiếng Việt có dấu hiển thị
đúng, các bảng/khối màu (.en xanh, .vi vàng) render ổn, không có chỗ trống.

## Lưu ý

- File `.html` và `.docx` là độc lập: sửa HTML **không** tự cập nhật DOCX.
  Nếu người dùng cần bản Word, nói rõ là phải xuất riêng.
- Giữ `lang="vi"` và `<meta charset="UTF-8">` để tiếng Việt không bị lỗi font.
- Dịch `.vi` theo nghĩa tự nhiên, mạch lạc; phần `exvi` chỉ dịch đúng câu ví dụ.
- Không bịa từ vựng hay ví dụ ngoài bài đọc — mọi `Example` phải trích từ bài.
```
