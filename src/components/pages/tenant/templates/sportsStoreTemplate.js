export const sportsStoreTemplate = `
<div class="sports-store-body" style="font-family: 'Outfit', sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 0;">
  <!-- Header / Navigation Bar -->
  <header style="background: rgba(11, 15, 25, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.08); padding: 1.2rem 2rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 1000;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 1.6rem; font-weight: 800; background: linear-gradient(135deg, #f43f5e, #fb7185); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 1px;">NEO-SPORT</span>
    </div>
    <nav style="display: flex; gap: 2rem;">
      <a href="#" style="color: #f43f5e; text-decoration: none; font-size: 0.95rem; font-weight: 600;">Trang Chủ</a>
      <a href="#shop-now" style="color: #9ca3af; text-decoration: none; font-size: 0.95rem; font-weight: 500;">Giày Thể Thao</a>
      <a href="#shop-now" style="color: #9ca3af; text-decoration: none; font-size: 0.95rem; font-weight: 500;">Quần Áo</a>
      <a href="#discover" style="color: #9ca3af; text-decoration: none; font-size: 0.95rem; font-weight: 500;">Bộ Sưu Tập</a>
      <a href="/orders/lookup" target="_blank" style="color: #9ca3af; text-decoration: none; font-size: 0.95rem; font-weight: 500;">Tra Cứu Đơn</a>
    </nav>
    <div style="display: flex; align-items: center; gap: 1.5rem;">
      <button style="background: none; border: none; cursor: pointer; color: #fff;">
        <svg style="width: 24px; height: 24px; fill: currentColor;" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      </button>
      <button class="view-cart-btn" style="background: none; border: none; cursor: pointer; color: #fff; position: relative;">
        <svg style="width: 24px; height: 24px; fill: currentColor;" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
        <span id="cart-count-badge" style="position: absolute; top: -5px; right: -5px; background: #f43f5e; color: #fff; border-radius: 50%; font-size: 0.75rem; padding: 2px 6px;">0</span>
      </button>
    </div>
  </header>

  <!-- Hero Section -->
  <section style="background: radial-gradient(circle at top right, rgba(244, 63, 94, 0.18), transparent 60%), linear-gradient(to right, #0b0f19 45%, rgba(11, 15, 25, 0.3)), url('https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1920') no-repeat center center/cover; padding: 9rem 3rem; text-align: left; display: flex; flex-direction: column; justify-content: center; min-height: 550px; position: relative; border-bottom: 1px solid rgba(255,255,255,0.03);">
    <div style="position: relative; z-index: 2; max-width: 650px;">
      <span style="color: #f43f5e; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-size: 0.85rem; display: inline-block; margin-bottom: 1.2rem; border: 1px solid rgba(244,63,94,0.3); padding: 5px 14px; border-radius: 20px; background: rgba(244,63,94,0.08);">BỘ SƯU TẬP MỚI 2026</span>
      <h1 style="font-size: 3.8rem; font-weight: 900; line-height: 1.1; margin: 0 0 1.5rem 0; background: linear-gradient(135deg, #ffffff 40%, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1px;">BỨT PHÁ GIỚI HẠN BẢN THÂN</h1>
      <p style="font-size: 1.15rem; color: #9ca3af; margin: 0 0 2.5rem 0; line-height: 1.7; font-weight: 300;">
        Khám phá dòng sản phẩm giày thể thao tối ưu hiệu suất và quần áo Dry-Fit thế hệ mới. Đem lại sự tự tin và năng lượng tràn đầy cho mỗi bước chạy của bạn.
      </p>
      <div style="display: flex; gap: 1.25rem;">
        <a href="#shop-now" style="background: linear-gradient(135deg, #f43f5e, #e11d48); color: #fff; text-decoration: none; padding: 1.1rem 2.2rem; border-radius: 10px; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 20px rgba(244, 63, 94, 0.4); display: inline-block; text-align: center;">Mua Ngay</a>
        <a href="#discover" style="border: 1px solid rgba(255,255,255,0.2); color: #fff; text-decoration: none; padding: 1.1rem 2.2rem; border-radius: 10px; font-weight: 700; font-size: 1rem; background: rgba(255,255,255,0.03); display: inline-block; text-align: center;">Xem Chi Tiết</a>
      </div>
    </div>
  </section>

  <!-- Value Badges -->
  <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; padding: 3.5rem 2rem; background: #0f172a; border-bottom: 1px solid rgba(255,255,255,0.05);">
    <div style="display: flex; gap: 15px; align-items: center; background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.03);">
      <div style="background: rgba(244,63,94,0.12); padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
        <svg style="width: 28px; height: 28px; fill: #f43f5e;" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM17 12V9.5h2.5l1.97 2.5H17z"/></svg>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 1.05rem; color: #fff; font-weight: 700;">Giao Hàng Siêu Tốc</h4>
        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #94a3b8;">Miễn phí vận chuyển cho đơn hàng > 500k</p>
      </div>
    </div>
    <div style="display: flex; gap: 15px; align-items: center; background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.03);">
      <div style="background: rgba(244,63,94,0.12); padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
        <svg style="width: 28px; height: 28px; fill: #f43f5e;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 1.05rem; color: #fff; font-weight: 700;">Đổi Trả Dễ Dàng</h4>
        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #94a3b8;">Hoàn trả dễ dàng trong vòng 30 ngày</p>
      </div>
    </div>
    <div style="display: flex; gap: 15px; align-items: center; background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.03);">
      <div style="background: rgba(244,63,94,0.12); padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
        <svg style="width: 28px; height: 28px; fill: #f43f5e;" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 1.05rem; color: #fff; font-weight: 700;">Hàng Chính Hãng</h4>
        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #94a3b8;">Cam kết sản phẩm chất lượng cao 100%</p>
      </div>
    </div>
  </section>

  <!-- Featured Products Section -->
  <section id="shop-now" style="padding: 6rem 2rem; background: #0b0f19;">
    <div style="text-align: center; margin-bottom: 4rem;">
      <h2 style="font-size: 2.3rem; font-weight: 800; margin: 0 0 0.6rem 0; letter-spacing: 0.5px; color: #fff;">SẢN PHẨM BÁN CHẠY</h2>
      <div style="width: 70px; height: 4px; background: #f43f5e; margin: 0 auto; border-radius: 2px;"></div>
    </div>

    <!-- Product Grid -->
    <div id="dynamic-products-container" class="products-grid" style="max-width: 1200px; margin: 0 auto;"></div>
  </section>

  <!-- Hot Deal Section -->
  <section id="discover" style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 7rem 2rem; display: flex; align-items: center; justify-content: center; gap: 4rem; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 300px; max-width: 500px;">
      <span style="color: #f43f5e; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px;">ƯU ĐÃI ĐẶC BIỆT</span>
      <h2 style="font-size: 2.7rem; font-weight: 900; margin: 0.5rem 0 1.5rem 0; color: #fff; line-height: 1.2;">GIẢM GIÁ ĐẾN 40% CHO BỘ SƯU TẬP HÈ</h2>
      <p style="color: #94a3b8; line-height: 1.8; margin-bottom: 2rem; font-size: 1.05rem;">
        Đừng bỏ lỡ cơ hội sở hữu những mẫu áo thun Dry-Fit siêu thoáng mát và giày running ôm chân tối ưu với mức giá tốt nhất năm. Ưu đãi áp dụng đến hết tháng này.
      </p>
      <div style="display: flex; gap: 2.5rem; margin-bottom: 2.5rem;">
        <div>
          <span style="display: block; font-size: 2rem; font-weight: 800; color: #f43f5e;">12</span>
          <span style="font-size: 0.8rem; color: #64748b; font-weight: 700;">Ngày</span>
        </div>
        <div>
          <span style="display: block; font-size: 2rem; font-weight: 800; color: #f43f5e;">08</span>
          <span style="font-size: 0.8rem; color: #64748b; font-weight: 700;">Giờ</span>
        </div>
        <div>
          <span style="display: block; font-size: 2rem; font-weight: 800; color: #f43f5e;">45</span>
          <span style="font-size: 0.8rem; color: #64748b; font-weight: 700;">Phút</span>
        </div>
      </div>
      <a href="#shop-now" style="background: #f43f5e; color: #fff; text-decoration: none; padding: 1.1rem 2.5rem; border-radius: 10px; font-weight: 700; transition: background 0.3s; box-shadow: 0 4px 20px rgba(244,63,94,0.3); display: inline-block;">Săn Sale Ngay</a>
    </div>
    <div style="flex: 1; min-width: 300px; max-width: 500px; position: relative;">
      <div style="position: absolute; top: -15px; left: -15px; right: 15px; bottom: 15px; border: 2px solid rgba(244,63,94,0.35); border-radius: 24px; z-index: 1;"></div>
      <img src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=800" alt="Hot Deal Model" style="width: 100%; border-radius: 24px; display: block; position: relative; z-index: 2; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);" />
    </div>
  </section>

  <!-- Newsletter -->
  <section style="background: #0f172a; padding: 6rem 2rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
    <div style="max-width: 600px; margin: 0 auto;">
      <h2 style="font-size: 2.2rem; font-weight: 800; color: #fff; margin-bottom: 1rem;">ĐĂNG KÝ NHẬN TIN KHUYẾN MÃI</h2>
      <p style="color: #64748b; margin-bottom: 2.5rem; font-size: 1rem;">Để lại email để nhận thông tin bộ sưu tập mới nhất và voucher giảm giá 10% độc quyền.</p>
      <form style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
        <input type="email" placeholder="Nhập địa chỉ email của bạn" style="background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0.9rem 1.5rem; color: #fff; flex: 1; min-width: 280px; outline: none; font-size: 1rem;" />
        <button type="button" style="background: #f43f5e; color: #fff; border: none; border-radius: 10px; padding: 0.9rem 2.2rem; font-weight: 700; cursor: pointer; font-size: 1rem;">Đăng Ký</button>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer style="background: #0b0f19; padding: 5rem 2rem; color: #64748b; font-size: 0.95rem; border-top: 1px solid rgba(255,255,255,0.02);">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4rem;">
      <div style="max-width: 400px;">
        <span style="font-size: 1.8rem; font-weight: 800; color: #fff; background: linear-gradient(135deg, #f43f5e, #fb7185); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 1px;">NEO-SPORT</span>
        <p style="margin-top: 1.2rem; line-height: 1.8; color: #94a3b8;">Đồng hành cùng bạn trên mọi hành trình thể thao và kiến tạo phong cách sống năng động hiện đại.</p>
      </div>
      <div>
        <h4 style="color: #fff; margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 700;">Liên Hệ</h4>
        <p style="margin: 0.5rem 0;">Email: contact@neo-sport.vn</p>
        <p style="margin: 0.5rem 0;">Hotline: 1900 6789</p>
        <p style="margin: 0.5rem 0;">Địa chỉ: Gian hàng L3-04, TTTM Megamall</p>
      </div>
      <div>
        <h4 style="color: #fff; margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 700;">Theo Dõi Chúng Tôi</h4>
        <div style="display: flex; gap: 1.5rem;">
          <a href="#" style="color: #94a3b8; text-decoration: none;">Facebook</a>
          <a href="#" style="color: #94a3b8; text-decoration: none;">Instagram</a>
          <a href="#" style="color: #94a3b8; text-decoration: none;">Tiktok</a>
        </div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 2.5rem; color: #64748b;">
      <p style="margin: 0;">&copy; 2026 NEO-SPORT. Toàn bộ quyền sở hữu được bảo lưu.</p>
    </div>
  </footer>
</div>
`;
