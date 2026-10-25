/**
 * chatbot.js - Trợ lý AI Mini Đấu Trường Esports (VCT Assistant)
 * Hỗ trợ giải đáp tất cả câu hỏi, thắc mắc về giải đấu, đăng ký, lệ phí, thể thức, dự đoán, BXH.
 */

(function () {
  // Tránh nạp trùng lặp
  if (window.VCT_CHATBOT_INITIALIZED) return;
  window.VCT_CHATBOT_INITIALIZED = true;

  // 1. TỰ ĐỘNG INJECT CSS CHO CHATBOT MINI
  const style = document.createElement("style");
  style.id = "vct-chatbot-style";
  style.textContent = `
    /* === Floating Launcher Button === */
    #vct-chatbot-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff4655 0%, #c41e3a 100%);
      box-shadow: 0 8px 24px rgba(255, 70, 85, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.2);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
      outline: none;
    }
    #vct-chatbot-fab:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 12px 28px rgba(255, 70, 85, 0.6), 0 0 16px rgba(255, 70, 85, 0.8);
    }
    #vct-chatbot-fab:active {
      transform: scale(0.95);
    }
    #vct-chatbot-fab .pulse-ring {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid #ff4655;
      animation: fabPulse 2s infinite ease-out;
      pointer-events: none;
    }
    @keyframes fabPulse {
      0% { transform: scale(0.95); opacity: 0.9; }
      100% { transform: scale(1.35); opacity: 0; }
    }
    #vct-chatbot-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #10b981;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #090a0f;
    }

    /* === Chatbox Container === */
    #vct-chatbox-window {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 580px;
      max-height: calc(100vh - 120px);
      background: #0f131a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(255, 70, 85, 0.15);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform-origin: bottom right;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(16px);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    #vct-chatbox-window.hidden {
      opacity: 0;
      transform: scale(0.85) translateY(20px);
      pointer-events: none;
      visibility: hidden;
    }

    /* === Header === */
    .vct-chat-header {
      background: linear-gradient(135deg, #171c26 0%, #10141d 100%);
      padding: 14px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .vct-bot-profile {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .vct-bot-avatar {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #ff4655 0%, #8b0000 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 900;
      font-size: 18px;
      box-shadow: 0 0 12px rgba(255, 70, 85, 0.4);
      position: relative;
    }
    .vct-bot-avatar::after {
      content: '';
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      background: #10b981;
      border-radius: 50%;
      border: 2px solid #0f131a;
    }
    .vct-bot-info h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .vct-bot-info .vct-badge-ai {
      background: rgba(255, 70, 85, 0.2);
      color: #ff4655;
      font-size: 9px;
      font-weight: 900;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid rgba(255, 70, 85, 0.4);
    }
    .vct-bot-info p {
      margin: 2px 0 0;
      font-size: 11px;
      color: #94a3b8;
    }
    .vct-chat-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .vct-chat-btn-icon {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .vct-chat-btn-icon:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }

    /* === Messages Area === */
    .vct-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    .vct-chat-messages::-webkit-scrollbar {
      width: 5px;
    }
    .vct-chat-messages::-webkit-scrollbar-thumb {
      background: #232a38;
      border-radius: 4px;
    }

    /* Message Bubbles */
    .vct-msg {
      display: flex;
      gap: 10px;
      max-width: 88%;
      animation: msgPop 0.25s ease-out;
    }
    @keyframes msgPop {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .vct-msg.bot {
      align-self: flex-start;
    }
    .vct-msg.user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    .vct-msg-bubble {
      padding: 11px 14px;
      border-radius: 14px;
      font-size: 13px;
      line-height: 1.5;
      word-break: break-word;
    }
    .vct-msg.bot .vct-msg-bubble {
      background: #19202c;
      color: #e2e8f0;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-top-left-radius: 4px;
    }
    .vct-msg.user .vct-msg-bubble {
      background: linear-gradient(135deg, #ff4655 0%, #e03242 100%);
      color: #ffffff;
      font-weight: 500;
      border-top-right-radius: 4px;
      box-shadow: 0 4px 12px rgba(255, 70, 85, 0.25);
    }
    .vct-msg-time {
      font-size: 10px;
      color: #64748b;
      margin-top: 4px;
      text-align: right;
    }
    .vct-msg.bot .vct-msg-time {
      text-align: left;
    }

    /* Interactive Action Links in Bot Message */
    .vct-chat-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #ff4655;
      background: rgba(255, 70, 85, 0.1);
      border: 1px solid rgba(255, 70, 85, 0.25);
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 11px;
      text-decoration: none;
      margin-top: 6px;
      transition: all 0.2s;
    }
    .vct-chat-link:hover {
      background: #ff4655;
      color: #ffffff;
    }

    /* Typing Dots */
    .vct-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 12px 16px;
      background: #19202c;
      border-radius: 14px;
      border-top-left-radius: 4px;
      width: fit-content;
    }
    .vct-typing span {
      width: 6px;
      height: 6px;
      background: #ff4655;
      border-radius: 50%;
      animation: typingBounce 1.4s infinite ease-in-out both;
    }
    .vct-typing span:nth-child(1) { animation-delay: -0.32s; }
    .vct-typing span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes typingBounce {
      0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* === Quick Suggestions Chips === */
    .vct-quick-chips {
      padding: 8px 16px 12px;
      display: flex;
      gap: 6px;
      overflow-x: auto;
      white-space: nowrap;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(15, 19, 26, 0.85);
    }
    .vct-quick-chips::-webkit-scrollbar {
      height: 3px;
    }
    .vct-quick-chips::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
    }
    .vct-chip-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .vct-chip-btn:hover {
      background: rgba(255, 70, 85, 0.15);
      border-color: #ff4655;
      color: #ffffff;
      transform: translateY(-1px);
    }

    /* === Input Area === */
    .vct-chat-input-bar {
      padding: 12px 14px;
      background: #121721;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .vct-chat-input-bar input {
      flex: 1;
      background: #1a202c;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 10px 14px;
      color: #ffffff;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }
    .vct-chat-input-bar input::placeholder {
      color: #64748b;
    }
    .vct-chat-input-bar input:focus {
      border-color: #ff4655;
      box-shadow: 0 0 0 2px rgba(255, 70, 85, 0.2);
    }
    .vct-chat-send-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #ff4655;
      border: none;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .vct-chat-send-btn:hover {
      background: #e03242;
      transform: scale(1.05);
    }
    .vct-chat-send-btn:active {
      transform: scale(0.95);
    }

    /* Mobile Responsive */
    @media (max-width: 480px) {
      #vct-chatbox-window {
        bottom: 84px;
        right: 12px;
        left: 12px;
        width: auto;
        height: 70vh;
      }
      #vct-chatbot-fab {
        bottom: 16px;
        right: 16px;
        width: 52px;
        height: 52px;
      }
    }
  `;
  document.head.appendChild(style);

  // 2. KHỞI TẠO CƠ SỞ TRI THỨC TOÀN DIỆN CỦA ĐẤU TRƯỜNG ESPORTS
  const KNOWLEDGE_BASE = [
    {
      keywords: ["đăng ký", "dang ky", "tham gia", "nop don", "nộp đơn", "cách đăng ký", "form", "đăng kí"],
      reply: `📋 **Hướng dẫn Đăng Ký Thi Đấu VCT 2026**:
1. Vào trang **[Đăng Ký Thi Đấu]** trên website.
2. Đọc kỹ Điều lệ giải đấu & cam kết Fair Play.
3. Chuyển khoản **lệ phí 100.000 VNĐ** (100k) theo mã QR hoặc thông tin STK Vietcombank.
4. Điền đầy đủ thông tin: Tên đội, Tag, Tên trưởng đội, SĐT/Zalo, Email, Danh sách tuyển thủ (5 chính thức + tối đa 2 dự bị).
5. Tải ảnh chụp biên lai chuyển khoản thành công và bấm **"GỬI ĐĂNG KÝ THI ĐẤU"**.`,
      actionLink: { text: "👉 Đến trang Đăng ký ngay", href: "tournament-register.html" }
    },
    {
      keywords: ["lệ phí", "le phi", "tiền", "tien", "chi phí", "bao nhiêu", "100k", "100000", "đóng phí", "stk", "tài khoản", "ngân hàng", "vietcombank", "vcb", "momo", "qr"],
      reply: `💰 **Thông tin Lệ Phí & Thanh Toán**:
• **Mức lệ phí**: **100.000 VNĐ (100k)** / mỗi đội tuyển (dùng tổ chức giải & đảm bảo cam kết tham gia).
• **Ngân hàng**: Vietcombank (VCB)
• **Số tài khoản**: \`1234567890\`
• **Chủ tài khoản**: DAUTRUONG ESPORTS
• **Cú pháp chuyển khoản**: \`DANGKY [TÊN ĐỘI]\` (Ví dụ: \`DANGKY PHOENIX FC\`)
*(Lưu ý: Lệ phí không hoàn trả sau khi BTC đã xác nhận danh sách thi đấu).*`,
      actionLink: { text: "Xem mã QR thanh toán", href: "tournament-register.html" }
    },
    {
      keywords: ["giải thưởng", "giai thuong", "tiền thưởng", "thưởng", "thuong", "vô địch", "top 1", "prize", "100tr", "100 triệu", "triệu"],
      reply: `🏆 **Tổng Giải Thưởng VCT DauTruongEsports 2026**:
Tổng giá trị giải thưởng lên đến **100.000.000 VNĐ** (Một trăm triệu đồng) cùng Cup Vô Địch và huy chương độc quyền VCT:
🥇 **Hạng 1 (Vô Địch)**: 50.000.000 VNĐ + Cúp Vô Địch + Suất đặc cách.
🥈 **Hạng 2 (Á Quân)**: 25.000.000 VNĐ + Kỷ niệm chương.
🥉 **Hạng 3**: 15.000.000 VNĐ.
🎖️ **Hạng 4**: 10.000.000 VNĐ.
⭐ Ngoài ra còn giải **MVP xuất sắc nhất giải đấu**!`
    },
    {
      keywords: ["thể thức", "the thuc", "bo3", "bo5", "luật", "quy định", "nhánh thắng", "nhánh thua", "luat", "thời gian", "trễ", "muộn", "gian lận", "hack", "cheat"],
      reply: `⚔️ **Thể Thức & Quy Định Thi Đấu**:
• **Thể thức trận đấu**: Vòng bảng & Vòng loại thi đấu **BO3** (thắng 2 ván). Trận Chung kết nhánh & Chung kết Tổng thi đấu **BO5** (thắng 3 ván).
• **Đội hình**: Bắt buộc 5 tuyển thủ chính thức, được đăng ký tối đa 2 dự bị.
• **Quy định giờ giấc**: Các đội phải có mặt trước giờ thi đấu **15 phút**. Trễ quá 15 phút sẽ bị xử thua trận (Walkover).
• **Nghiêm cấm tuyệt đối**: Mọi hành vi gian lận, hack/cheat phần mềm bên thứ 3, smurf tài khoản hoặc toxic sẽ bị **loại vĩnh viễn** khỏi hệ thống!`
    },
    {
      keywords: ["lịch", "lich", "lịch thi đấu", "hôm nay", "khi nào", "thời gian", "mấy giờ", "roadmap", "mùa giải", "vòng", "stage"],
      reply: `📅 **Lịch Thi Đấu VCT 2026**:
• **Khởi Động**: 15/01 – 15/02 (Các khu vực)
• **Masters Santiago**: 28/02 – 16/03
• **Stage 1 (Vòng 1)**: 01/04 – 24/05
• **Masters London**: 06/06 – 21/06
• **Champions Paris**: 15/08 – 30/08
👉 Trận đấu hôm nay đang phát trực tiếp trên Trang Chủ: **Global Esports (GE) vs Nongshim RedForce (NS)**!`,
      actionLink: { text: "Xem Trực Tiếp trên Trang Chủ", href: "index.html" }
    },
    {
      keywords: ["dự đoán", "du doan", "pickem", "pick'em", "pick'ems", "điểm", "vote", "bình chọn", "phần thưởng dự đoán"],
      reply: `🎯 **Chương Trình Dự Đoán Pick'Ems**:
• Người chơi có thể tham gia dự đoán tỉ số và đội thắng trong tất cả các cặp đấu.
• Dự đoán chính xác nhận điểm thưởng để leo Bảng Xếp Hạng Người Dự Đoán xuất sắc và đổi Skin vũ khí / Battle Pass.
• Bình chọn sẽ khóa trước khi trận đấu chính thức bắt đầu 10 phút!`,
      actionLink: { text: "Tham gia Dự Đoán ngay", href: "dudoan.html" }
    },
    {
      keywords: ["bảng xếp hạng", "bang xep hang", "xếp hạng", "xep hang", "bxh", "power rankings", "top", "aws", "prx", "geng", "fnatic", "sentinels"],
      reply: `📊 **Bảng Xếp Hạng Sức Mạnh (Global Power Rankings)**:
• Được tính toán và cập nhật theo thời gian thực công nghệ AWS dựa trên điểm phong độ, K/D/A, chỉ số ACS và tỉ số bản đồ.
• Các đội tuyển top đầu hiện tại: **Fnatic, Paper Rex (PRX), Gen.G Esports, 100 Thieves, Sentinels, Team Heretics**...`,
      actionLink: { text: "Xem Bảng Xếp Hạng chi tiết", href: "xephangsucmanh.html" }
    },
    {
      keywords: ["bản đồ", "ban do", "map", "haven", "sunset", "bind", "ascent", "lotus", "split", "abyss"],
      reply: `🗺️ **Danh Sách Bản Đồ Thi Đấu VCT 2026**:
Map Pool hiện tại gồm: **Sunset, Haven, Bind, Ascent, Lotus, Split, Abyss**.
• Quy trình Pick / Ban: Đội hạt giống cao được quyền cấm hoặc chọn trước theo thứ tự Ban-Ban-Pick-Pick-Ban-Ban-Decider.`
    },
    {
      keywords: ["tài khoản", "tai khoan", "đăng nhập", "dang nhap", "mật khẩu", "quên", "admin", "quản trị", "liên hệ", "hotline", "hỗ trợ", "support", "email"],
      reply: `🔐 **Hỗ Trợ Tài Khoản & Quản Trị Viên**:
• Bạn có thể tạo tài khoản miễn phí để lưu lịch sử dự đoán Pick'Ems và quản lý thông tin đội.
• Nếu bạn là Admin: Sử dụng tài khoản email Admin để truy cập Admin Dashboard.
• Cần hỗ trợ trực tiếp từ Ban Tổ Chức?
  - 📧 Email: \`admin@gmail.com\` hoặc \`phambaolong912002@gmail.com\`
  - 💬 Kênh Discord: Đấu Trường Esports VCT Vietnam`,
      actionLink: { text: "Trang Đăng Nhập", href: "login.html" }
    },
    {
      keywords: ["chào", "chao", "hello", "hi", "bot", "alo", "ơi", "ê", "help", "giúp"],
      reply: `👋 **Xin chào Tuyển thủ / Huấn luyện viên!**
Tôi là Trợ lý AI của **Đấu Trường Esports**. Bạn cần mình giải đáp về:
1. 📋 Hướng dẫn nộp đơn Đăng ký thi đấu
2. 💰 Lệ phí (100k) & Cơ cấu giải thưởng (100 triệu)
3. ⚔️ Thể thức thi đấu BO3/BO5 & Luật trễ giờ
4. 🎯 Cách tham gia Dự đoán Pick'Ems nhận thưởng
5. 📊 Bảng xếp hạng sức mạnh các đội tuyển VCT
Hãy chọn gợi ý nhanh bên dưới hoặc gõ câu hỏi nhé!`
    },
    {
      keywords: ["cảm ơn", "cam on", "thanks", "thank", "ok", "tuyệt", "tuyet", "hay quá", "tks"],
      reply: `❤️ Rất vui được hỗ trợ bạn! Chúc bạn và đội tuyển đạt thành tích cao nhất tại **VCT DauTruongEsports 2026**! Hãy hỏi thêm nếu có bất kỳ thắc mắc nào nhé! 🔥`
    }
  ];

  // 3. TẠO GIAO DIỆN HTML CHO CHATBOT
  function createChatbotUI() {
    // 3.1. Floating Button (FAB)
    const fab = document.createElement("button");
    fab.id = "vct-chatbot-fab";
    fab.setAttribute("aria-label", "Mở trợ lý ảo Đấu Trường Esports");
    fab.innerHTML = `
      <div class="pulse-ring"></div>
      <div id="vct-chatbot-badge" title="Đang trực tuyến"></div>
      <svg id="vct-fab-icon-chat" class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:28px;height:28px">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
      </svg>
      <svg id="vct-fab-icon-close" class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:28px;height:28px;display:none;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    `;

    // 3.2. Cửa sổ Chat (Window)
    const windowEl = document.createElement("div");
    windowEl.id = "vct-chatbox-window";
    windowEl.className = "hidden";
    windowEl.innerHTML = `
      <!-- Header -->
      <div class="vct-chat-header">
        <div class="vct-bot-profile">
          <div class="vct-bot-avatar">🤖</div>
          <div class="vct-bot-info">
            <h4>VCT ASSISTANT <span class="vct-badge-ai">AI BOT</span></h4>
            <p>Hỗ trợ giải đấu 24/7</p>
          </div>
        </div>
        <div class="vct-chat-header-actions">
          <button id="vct-chat-clear-btn" class="vct-chat-btn-icon" title="Xóa lịch sử chat">
            <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
          <button id="vct-chat-close-btn" class="vct-chat-btn-icon" title="Đóng cửa sổ">
            <svg style="width:18px;height:18px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div id="vct-chat-messages-container" class="vct-chat-messages">
        <!-- Tin nhắn khởi tạo sẽ được render bởi JS -->
      </div>

      <!-- Quick Chips -->
      <div class="vct-quick-chips">
        <button class="vct-chip-btn" data-query="Cách đăng ký thi đấu?">📋 Đăng ký thi đấu</button>
        <button class="vct-chip-btn" data-query="Lệ phí và cách đóng 100k?">💰 Lệ phí 100k</button>
        <button class="vct-chip-btn" data-query="Tổng giải thưởng bao nhiêu?">🏆 Giải thưởng 100tr</button>
        <button class="vct-chip-btn" data-query="Thể thức thi đấu như thế nào?">⚔️ Thể thức Bo3/Bo5</button>
        <button class="vct-chip-btn" data-query="Lịch thi đấu VCT 2026?">📅 Lịch thi đấu</button>
        <button class="vct-chip-btn" data-query="Cách chơi dự đoán Pick'Ems?">🎯 Dự đoán Pick'Ems</button>
        <button class="vct-chip-btn" data-query="Thông tin liên hệ Admin?">📞 Liên hệ Admin</button>
      </div>

      <!-- Input Form -->
      <form id="vct-chat-form" class="vct-chat-input-bar">
        <input id="vct-chat-input" type="text" placeholder="Nhập thắc mắc của bạn về giải đấu..." autocomplete="off" />
        <button type="submit" class="vct-chat-send-btn" aria-label="Gửi tin nhắn">
          <svg style="width:18px;height:18px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </form>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(windowEl);

    setupChatbotEvents(fab, windowEl);
  }

  // 4. XỬ LÝ SỰ KIỆN VÀ TRẢ LỜI CÂU HỎI
  function setupChatbotEvents(fab, windowEl) {
    const chatIcon = document.getElementById("vct-fab-icon-chat");
    const closeIcon = document.getElementById("vct-fab-icon-close");
    const closeBtn = document.getElementById("vct-chat-close-btn");
    const clearBtn = document.getElementById("vct-chat-clear-btn");
    const messagesBox = document.getElementById("vct-chat-messages-container");
    const form = document.getElementById("vct-chat-form");
    const input = document.getElementById("vct-chat-input");

    function toggleChat(open) {
      const isHidden = windowEl.classList.contains("hidden");
      const shouldOpen = open !== undefined ? open : isHidden;

      if (shouldOpen) {
        windowEl.classList.remove("hidden");
        chatIcon.style.display = "none";
        closeIcon.style.display = "block";
        input.focus();
        // Cuộn xuống cuối
        setTimeout(() => { messagesBox.scrollTop = messagesBox.scrollHeight; }, 100);
      } else {
        windowEl.classList.add("hidden");
        chatIcon.style.display = "block";
        closeIcon.style.display = "none";
      }
    }

    fab.addEventListener("click", () => toggleChat());
    closeBtn.addEventListener("click", () => toggleChat(false));

    // Nút xóa lịch sử
    clearBtn.addEventListener("click", () => {
      sessionStorage.removeItem("vct_chat_history");
      messagesBox.innerHTML = "";
      renderWelcomeMessage();
    });

    // Bấm các nút Quick Chips
    document.querySelectorAll(".vct-chip-btn").forEach((chip) => {
      chip.addEventListener("click", () => {
        const query = chip.getAttribute("data-query");
        if (query) {
          handleUserSubmit(query);
        }
      });
    });

    // Submit form chat
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      input.value = "";
      handleUserSubmit(query);
    });

    // Render tin nhắn chào đón hoặc lịch sử trước đó
    loadChatHistory();
  }

  // Thêm tin nhắn vào giao diện
  function appendMessage(sender, text, actionLink = null) {
    const messagesBox = document.getElementById("vct-chat-messages-container");
    if (!messagesBox) return;

    const timeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const msgDiv = document.createElement("div");
    msgDiv.className = `vct-msg ${sender}`;

    // Format text: chuyển markdown đơn giản thành HTML
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code style='background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:4px;font-family:monospace;color:#ff4655;'>$1</code>")
      .replace(/\n/g, "<br>");

    let actionHtml = "";
    if (actionLink && actionLink.href && actionLink.text) {
      actionHtml = `<br><a href="${actionLink.href}" class="vct-chat-link">${actionLink.text}</a>`;
    }

    msgDiv.innerHTML = `
      <div class="vct-msg-bubble">
        ${formattedText}
        ${actionHtml}
        <div class="vct-msg-time">${timeStr}</div>
      </div>
    `;

    messagesBox.appendChild(msgDiv);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    saveChatHistory();
  }

  // Hiển thị hiệu ứng gõ chữ
  function showTypingIndicator() {
    const messagesBox = document.getElementById("vct-chat-messages-container");
    const typingDiv = document.createElement("div");
    typingDiv.id = "vct-typing-indicator";
    typingDiv.className = "vct-msg bot";
    typingDiv.innerHTML = `
      <div class="vct-typing">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesBox.appendChild(typingDiv);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function hideTypingIndicator() {
    const typing = document.getElementById("vct-typing-indicator");
    if (typing) typing.remove();
  }

  // Logic xử lý NLP / Tìm câu trả lời tốt nhất
  function findBestAnswer(query) {
    const normalized = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt để so sánh
      .replace(/[?!,.]/g, "");

    const rawLower = query.toLowerCase();

    let bestMatch = null;
    let highestScore = 0;

    for (const item of KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of item.keywords) {
        const kwNorm = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (rawLower.includes(kw.toLowerCase()) || normalized.includes(kwNorm)) {
          score += kw.length; // từ khóa càng dài điểm càng cao
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    // Nếu tìm thấy câu trả lời khớp
    if (bestMatch && highestScore > 0) {
      return {
        reply: bestMatch.reply,
        actionLink: bestMatch.actionLink || null
      };
    }

    // Fallback nếu không hiểu
    return {
      reply: `Xin lỗi bạn, câu hỏi này mình chưa có thông tin chính xác. Bạn có thể thử các gợi ý:
• **"Cách đăng ký thi đấu"**
• **"Lệ phí 100k chuyển khoản như thế nào?"**
• **"Thể thức Bo3 hay Bo5?"**
• **"Tổng giải thưởng bao nhiêu?"**
• Hoặc liên hệ trực tiếp Admin qua email: \`admin@gmail.com\` để được giải đáp ngay nhé!`,
      actionLink: { text: "Gửi câu hỏi tới Admin", href: "tournament-register.html" }
    };
  }

  // Xử lý gửi tin nhắn của User
  function handleUserSubmit(userQuery) {
    appendMessage("user", userQuery);
    showTypingIndicator();

    // Giả lập độ trễ thông minh (300ms - 600ms) tạo cảm giác AI đang suy nghĩ
    setTimeout(() => {
      hideTypingIndicator();
      const ans = findBestAnswer(userQuery);
      appendMessage("bot", ans.reply, ans.actionLink);
    }, 450);
  }

  // Lưu và tải lịch sử chat trong Session
  function saveChatHistory() {
    const messagesBox = document.getElementById("vct-chat-messages-container");
    if (messagesBox) {
      sessionStorage.setItem("vct_chat_history", messagesBox.innerHTML);
    }
  }

  function loadChatHistory() {
    const saved = sessionStorage.getItem("vct_chat_history");
    const messagesBox = document.getElementById("vct-chat-messages-container");
    if (saved && messagesBox) {
      messagesBox.innerHTML = saved;
    } else {
      renderWelcomeMessage();
    }
  }

  function renderWelcomeMessage() {
    appendMessage(
      "bot",
      `👋 **Chào mừng bạn đến với Đấu Trường Esports VCT 2026!**\nTôi là **VCT Assistant**, trợ lý ảo hỗ trợ 24/7. Bạn có thể hỏi bất kỳ điều gì về:
• 📋 Hướng dẫn đăng ký thi đấu
• 💰 Lệ phí (100k) & Giải thưởng (100 triệu)
• ⚔️ Thể thức BO3/BO5 & Luật thi đấu
• 🎯 Dự đoán Pick'Ems & Bảng xếp hạng sức mạnh
Hãy chọn câu hỏi nhanh bên dưới hoặc nhắn tin trực tiếp nhé!`
    );
  }

  // Tự động khởi chạy khi DOM sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createChatbotUI);
  } else {
    createChatbotUI();
  }
})();
