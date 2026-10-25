/**
 * auth-nav.js - Quản lý đồng bộ trạng thái đăng nhập, Avatar, Tên người dùng, Phân quyền và Mobile Navigation trên toàn bộ các trang.
 */

// Lấy thông tin user hiện tại từ localStorage hoặc Supabase
async function getStoredAuthUser() {
  const isLoggedIn = localStorage.getItem("vctLoggedIn") === "true";
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("vctCurrentUser") || "null");
  } catch (e) {
    user = null;
  }
  let role = localStorage.getItem("vctUserRole") || (user && user.role) || "user";

  // Kiểm tra Supabase session nếu có
  if (window.vctSupabase) {
    try {
      const { data } = await window.vctSupabase.auth.getSession();
      if (data && data.session && data.session.user) {
        const supaUser = data.session.user;
        const email = supaUser.email || (user ? user.email : "");
        const username = supaUser.user_metadata?.username || (user ? user.username : "") || email.split("@")[0];
        
        const ADMIN_EMAILS = ["admin@gmail.com", "phambaolong912002@gmail.com"];
        // Kiểm tra role admin
        if (ADMIN_EMAILS.includes(email) || supaUser.user_metadata?.role === "admin") {
          role = "admin";
        }

        user = {
          id: supaUser.id,
          email: email,
          username: username,
          role: role
        };

        localStorage.setItem("vctLoggedIn", "true");
        localStorage.setItem("vctUserRole", role);
        localStorage.setItem("vctCurrentUser", JSON.stringify(user));
        return { isLoggedIn: true, user, role };
      }
    } catch (err) {
      console.warn("Không thể lấy Supabase session:", err);
    }
  }

  if (isLoggedIn && user) {
    return { isLoggedIn: true, user, role };
  }

  // Trường hợp đã set vctLoggedIn = true nhưng chưa có vctCurrentUser (ví dụ từ phiên cũ)
  if (isLoggedIn) {
    user = {
      email: role === "admin" ? "admin@gmail.com" : "user@dautruong.vn",
      username: role === "admin" ? "Quản Trị Viên" : "Tuyển Thủ",
      role: role
    };
    localStorage.setItem("vctCurrentUser", JSON.stringify(user));
    return { isLoggedIn: true, user, role };
  }

  return { isLoggedIn: false, user: null, role: null };
}

// Hàm cài đặt và điều khiển thanh Mobile Drawer Navigation
function setupMobileMenu(isLoggedIn, user, role) {
  const toggleBtn = document.getElementById("mobileMenuToggle");
  const drawer = document.getElementById("mobileNavDrawer");
  const openIcon = document.getElementById("mobileMenuOpenIcon");
  const closeIcon = document.getElementById("mobileMenuCloseIcon");
  const mobileUserSection = document.getElementById("mobileUserSection");

  if (!toggleBtn || !drawer) return;

  function toggleDrawer(open) {
    const shouldOpen = open !== undefined ? open : drawer.classList.contains("hidden");
    if (shouldOpen) {
      drawer.classList.remove("hidden");
      toggleBtn.setAttribute("aria-expanded", "true");
      if (openIcon) openIcon.classList.add("hidden");
      if (closeIcon) closeIcon.classList.remove("hidden");
      document.body.classList.add("overflow-y-hidden");
    } else {
      drawer.classList.add("hidden");
      toggleBtn.setAttribute("aria-expanded", "false");
      if (openIcon) openIcon.classList.remove("hidden");
      if (closeIcon) closeIcon.classList.add("hidden");
      document.body.classList.remove("overflow-y-hidden");
    }
  }

  toggleBtn.onclick = (e) => {
    e.stopPropagation();
    toggleDrawer();
  };

  // Đóng khi click ngoài drawer hoặc click vào link trong drawer
  drawer.addEventListener("click", (e) => {
    if (e.target.closest("a") || e.target.closest("button:not(#mobileMenuToggle)")) {
      toggleDrawer(false);
    }
  });

  document.addEventListener("click", (e) => {
    if (!drawer.contains(e.target) && !toggleBtn.contains(e.target) && !drawer.classList.contains("hidden")) {
      toggleDrawer(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !drawer.classList.contains("hidden")) {
      toggleDrawer(false);
    }
  });

  // Đồng bộ giao diện Mobile User Section
  if (mobileUserSection) {
    if (isLoggedIn && user) {
      const displayName = user.username || (user.email ? user.email.split("@")[0] : "Tài khoản");
      const initial = displayName.charAt(0).toUpperCase();
      const isAdmin = role === "admin";
      mobileUserSection.innerHTML = `
        <div class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10 mb-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff4655] ${isAdmin ? 'ring-2 ring-yellow-400' : ''} text-white font-black text-sm uppercase shadow">
            ${initial}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-black text-white truncate">${displayName.toUpperCase()}</span>
              ${isAdmin ? '<span class="bg-[#ff4655] text-[9px] font-black px-1.5 py-0.5 rounded text-white tracking-wider">ADMIN</span>' : ''}
            </div>
            <div class="text-[11px] text-gray-400 truncate">${user.email || ''}</div>
          </div>
        </div>
        <div class="space-y-1 font-sans text-xs font-bold uppercase">
          ${isAdmin ? '<a href="admin.html" class="flex items-center gap-2 p-2.5 rounded-lg text-[#ff4655] bg-[#ff4655]/10 hover:bg-[#ff4655]/20 font-black">⚡ ADMIN DASHBOARD</a>' : ''}
          <a href="profile.html" class="flex items-center gap-2 p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10">👤 HỒ SƠ NGƯỜI DÙNG</a>
          <a href="settings.html" class="flex items-center gap-2 p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10">⚙️ CÀI ĐẶT</a>
          <button id="mobileLogoutBtn" type="button" class="w-full flex items-center gap-2 p-2.5 rounded-lg text-left text-[#ff4655] hover:bg-[#ff4655]/10">🚪 ĐĂNG XUẤT</button>
        </div>
      `;
      const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
      if (mobileLogoutBtn) {
        mobileLogoutBtn.onclick = () => {
          const mainLogout = document.getElementById("logoutButton");
          if (mainLogout) {
            mainLogout.click();
          } else {
            localStorage.removeItem("vctLoggedIn");
            localStorage.removeItem("vctUserRole");
            localStorage.removeItem("vctCurrentUser");
            window.location.reload();
          }
        };
      }
    } else {
      mobileUserSection.innerHTML = `
        <a href="login.html" class="flex items-center justify-center w-full py-3 bg-[#ff4655] hover:bg-[#e03e4c] text-white text-xs font-black tracking-widest uppercase rounded-lg shadow-md transition">
          ĐĂNG NHẬP / ĐĂNG KÝ
        </a>
      `;
    }
  }
}

// Hàm khởi tạo và đồng bộ thanh điều hướng (Navbar)
async function initAuthNavbar() {
  const loginLink = document.getElementById("loginLink");
  const accountMenu = document.getElementById("accountMenu");
  const accountButton = document.getElementById("accountButton");
  const accountDropdown = document.getElementById("accountDropdown");
  const logoutButton = document.getElementById("logoutButton");
  const accountName = document.getElementById("accountName");
  const userAvatarIcon = document.getElementById("userAvatarIcon");
  const adminBadge = document.getElementById("adminBadge");
  const adminDashboardLink = document.getElementById("adminDashboardLink");
  const dropdownUserName = document.getElementById("dropdownUserName");
  const dropdownUserEmail = document.getElementById("dropdownUserEmail");

  const { isLoggedIn, user, role } = await getStoredAuthUser();

  // Khởi tạo Mobile Menu với trạng thái auth hiện tại
  setupMobileMenu(isLoggedIn, user, role);

  if (!loginLink && !accountMenu) return;

  if (isLoggedIn && user) {
    // Ẩn nút Đăng nhập, hiện Menu tài khoản
    if (loginLink) loginLink.classList.add("hidden");
    if (accountMenu) accountMenu.classList.remove("hidden");

    // Hiển thị tên tài khoản
    const displayName = user.username || (user.email ? user.email.split("@")[0] : "Tài khoản");
    if (accountName) {
      accountName.textContent = displayName.toUpperCase();
    }

    // Hiển thị ký tự đầu làm Avatar
    if (userAvatarIcon) {
      const initial = displayName.charAt(0).toUpperCase();
      userAvatarIcon.textContent = initial;
      if (role === "admin") {
        userAvatarIcon.className = "flex h-7 w-7 items-center justify-center rounded-full bg-[#ff4655] ring-2 ring-yellow-400 text-white font-black text-xs uppercase shadow";
      } else {
        userAvatarIcon.className = "flex h-7 w-7 items-center justify-center rounded-full bg-[#ff4655] text-white font-black text-xs uppercase";
      }
    }

    // Nếu là Admin thì hiện huy hiệu ADMIN và Link sang Admin Dashboard
    if (role === "admin") {
      if (adminBadge) adminBadge.classList.remove("hidden");
      if (adminDashboardLink) {
        adminDashboardLink.classList.remove("hidden");
        adminDashboardLink.classList.add("flex");
      }
    } else {
      if (adminBadge) adminBadge.classList.add("hidden");
      if (adminDashboardLink) {
        adminDashboardLink.classList.add("hidden");
        adminDashboardLink.classList.remove("flex");
      }
    }

    // Thông tin trong dropdown
    if (dropdownUserName) dropdownUserName.textContent = displayName;
    if (dropdownUserEmail) dropdownUserEmail.textContent = user.email || "";

  } else {
    // Chưa đăng nhập: hiện nút đăng nhập, ẩn menu tài khoản
    if (loginLink) loginLink.classList.remove("hidden");
    if (accountMenu) accountMenu.classList.add("hidden");
  }

  // Bắt sự kiện bấm vào nút mở menu dropdown
  if (accountButton && accountDropdown) {
    accountButton.onclick = (e) => {
      e.stopPropagation();
      const isHidden = accountDropdown.classList.toggle("hidden");
      accountButton.setAttribute("aria-expanded", String(!isHidden));
    };

    // Bấm ra ngoài màn hình thì đóng menu
    document.addEventListener("click", (e) => {
      if (!accountButton.contains(e.target) && !accountDropdown.contains(e.target)) {
        accountDropdown.classList.add("hidden");
        accountButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Bắt sự kiện Đăng xuất
  if (logoutButton) {
    logoutButton.onclick = async (e) => {
      e.preventDefault();
      if (window.vctSupabase) {
        try {
          await window.vctSupabase.auth.signOut();
        } catch (err) {
          console.warn("Lỗi sign out:", err);
        }
      }
      localStorage.removeItem("vctLoggedIn");
      localStorage.removeItem("vctUserRole");
      localStorage.removeItem("vctCurrentUser");

      // Cập nhật lại giao diện
      if (loginLink) loginLink.classList.remove("hidden");
      if (accountMenu) accountMenu.classList.add("hidden");
      if (accountDropdown) accountDropdown.classList.add("hidden");

      // Nếu đang ở trang admin thì chuyển về trang login
      if (window.location.pathname.includes("admin.html")) {
        window.location.href = "login.html";
      } else {
        window.location.reload();
      }
    };
  }
}

// Tự động khởi chạy khi tải trang
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuthNavbar);
} else {
  initAuthNavbar();
}

// Lắng nghe thay đổi auth từ Supabase
if (window.vctSupabase) {
  try {
    window.vctSupabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        localStorage.removeItem("vctLoggedIn");
        localStorage.removeItem("vctUserRole");
        localStorage.removeItem("vctCurrentUser");
        initAuthNavbar();
      } else if (event === "SIGNED_IN" && session) {
        initAuthNavbar();
      }
    });
  } catch (e) {}
}
