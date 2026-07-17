export const foodStoreTemplate = `
<div class="food-store-body" style="font-family: 'Outfit', sans-serif; background-color: #0b0604; color: #f5efe6; margin: 0; padding: 0; position: relative;">
  <!-- Header / Navigation Bar -->
  <header style="background: rgba(11, 6, 4, 0.9); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(230,95,43,0.15); padding: 1.2rem 2rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 1000;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 1.6rem; font-weight: 800; background: linear-gradient(135deg, #e65f2b, #ff8c32); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 1px;">GUSTO RESTO</span>
    </div>
    <nav style="display: flex; gap: 2rem;">
      <a href="#" style="color: #e65f2b; text-decoration: none; font-size: 0.95rem; font-weight: 600;">Trang Chủ</a>
      <a href="#menu-section" style="color: #c9c1b5; text-decoration: none; font-size: 0.95rem; font-weight: 500;">Thực Đơn</a>
      <a href="#voucher-section" style="color: #c9c1b5; text-decoration: none; font-size: 0.95rem; font-weight: 500;">Đặt Vé & Voucher</a>
      <button class="book-table-btn" style="background: none; border: none; padding: 0; color: #c9c1b5; font-size: 0.95rem; font-weight: 500; cursor: pointer;">Đặt Bàn</button>
      <a href="/orders/lookup" target="_blank" style="color: #c9c1b5; text-decoration: none; font-size: 0.95rem; font-weight: 500;">Tra Cứu Đơn</a>
    </nav>
    <div style="display: flex; align-items: center; gap: 1.5rem;">
      <button class="book-table-btn" style="background: linear-gradient(135deg, #e65f2b, #ff8c32); border: none; padding: 0.6rem 1.2rem; border-radius: 20px; color: #fff; font-weight: 700; font-size: 0.85rem; cursor: pointer; box-shadow: 0 4px 15px rgba(230, 95, 43, 0.35);">Đặt Bàn Ngay</button>
      <button class="view-cart-btn" style="background: none; border: none; cursor: pointer; color: #fff; position: relative;">
        <svg style="width: 24px; height: 24px; fill: currentColor;" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
        <span id="cart-count-badge" style="position: absolute; top: -5px; right: -5px; background: #e65f2b; color: #fff; border-radius: 50%; font-size: 0.75rem; padding: 2px 6px;">0</span>
      </button>
    </div>
  </header>

  <!-- Hero Section -->
  <section style="background: radial-gradient(circle at top right, rgba(230, 95, 43, 0.2), transparent 70%), linear-gradient(to right, #0b0604 50%, rgba(11, 6, 4, 0.4)), url('https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1920') no-repeat center center/cover; padding: 9rem 3rem; text-align: left; display: flex; flex-direction: column; justify-content: center; min-height: 550px; position: relative; border-bottom: 1px solid rgba(230,95,43,0.1);">
    <div style="position: relative; z-index: 2; max-width: 650px;">
      <span style="color: #ff8c32; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-size: 0.85rem; display: inline-block; margin-bottom: 1.2rem; border: 1px solid rgba(230,95,43,0.4); padding: 5px 14px; border-radius: 20px; background: rgba(230,95,43,0.08);">TTTM MEGAMALL - GIAN HÀNG L4-10</span>
      <h1 style="font-size: 3.8rem; font-weight: 900; line-height: 1.1; margin: 0 0 1.5rem 0; background: linear-gradient(135deg, #ffffff 40%, #ffd3b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1px;">HƯƠNG VỊ TINH HOA THƯỢNG HẠNG</h1>
      <p style="font-size: 1.15rem; color: #c9c1b5; margin: 0 0 2.5rem 0; line-height: 1.7; font-weight: 300;">
        Trải nghiệm hành trình ẩm thực phong phú với các món Steak bò Mỹ nướng củi, Sashimi tươi sống chuẩn Nhật và các dòng Pasta sốt Truffle thơm ngậy bậc nhất.
      </p>
      <div style="display: flex; gap: 1.25rem;">
        <button class="book-table-btn" style="background: linear-gradient(135deg, #e65f2b, #ff8c32); color: #fff; border: none; padding: 1.1rem 2.2rem; border-radius: 10px; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 20px rgba(230, 95, 43, 0.4); cursor: pointer;">Đặt Bàn Ngay</button>
        <a href="#menu-section" style="border: 1px solid rgba(255,255,255,0.2); color: #fff; text-decoration: none; padding: 1.1rem 2.2rem; border-radius: 10px; font-weight: 700; font-size: 1rem; background: rgba(255,255,255,0.03); display: inline-block; text-align: center;">Xem Thực Đơn</a>
      </div>
    </div>
  </section>

  <!-- Restaurant Features Badges -->
  <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; padding: 3.5rem 2rem; background: #130a07; border-bottom: 1px solid rgba(230,95,43,0.1);">
    <div style="display: flex; gap: 15px; align-items: center; background: rgba(255,255,255,0.01); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(230,95,43,0.05);">
      <div style="background: rgba(230,95,43,0.12); padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
        <svg style="width: 28px; height: 28px; fill: #ff8c32;" viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-8.03c2.09-.13 3.75-1.85 3.75-3.97V2h-2v7zm7-3c-1.65 0-3 1.35-3 3v7h3v6h2V6h-2z"/></svg>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 1.05rem; color: #fff; font-weight: 700;">Đầu Bếp Chuẩn 5 Sao</h4>
        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #a8a096;">Các món ăn nướng củi & tẩm ướp độc quyền</p>
      </div>
    </div>
    <div style="display: flex; gap: 15px; align-items: center; background: rgba(255,255,255,0.01); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(230,95,43,0.05);">
      <div style="background: rgba(230,95,43,0.12); padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
        <svg style="width: 28px; height: 28px; fill: #ff8c32;" viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/></svg>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 1.05rem; color: #fff; font-weight: 700;">Không Gian Đẳng Cấp</h4>
        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #a8a096;">Sang trọng, có phòng VIP riêng biệt</p>
      </div>
    </div>
    <div style="display: flex; gap: 15px; align-items: center; background: rgba(255,255,255,0.01); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(230,95,43,0.05);">
      <div style="background: rgba(230,95,43,0.12); padding: 12px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
        <svg style="width: 28px; height: 28px; fill: #ff8c32;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>
      </div>
      <div>
        <h4 style="margin: 0; font-size: 1.05rem; color: #fff; font-weight: 700;">Hỗ Trợ Nhanh Chóng</h4>
        <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #a8a096;">Đặt chỗ tiện lợi, chăm sóc chu đáo</p>
      </div>
    </div>
  </section>

  <!-- Dishes Menu Section -->
  <section id="menu-section" style="padding: 6rem 2rem; background: #0b0604;">
    <div style="text-align: center; margin-bottom: 4rem;">
      <h2 style="font-size: 2.3rem; font-weight: 800; margin: 0 0 0.6rem 0; letter-spacing: 0.5px; color: #fff;">MÓN NGON NỔI BẬT</h2>
      <div style="width: 70px; height: 4px; background: #e65f2b; margin: 0 auto; border-radius: 2px;"></div>
    </div>

    <!-- Product Grid (Dishes) -->
    <div id="dynamic-products-container" class="products-grid" style="max-width: 1200px; margin: 0 auto;"></div>
  </section>

  <!-- Tickets & Voucher Section -->
  <section id="voucher-section" style="background: linear-gradient(135deg, #130a07 0%, #20110c 100%); padding: 7rem 2rem; border-top: 1px solid rgba(230,95,43,0.1); border-bottom: 1px solid rgba(230,95,43,0.1);">
    <div style="max-width: 1200px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 4rem;">
        <span style="color: #e65f2b; font-weight: 700; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px;">ƯU ĐÃI ĐỘC QUYỀN TRÊN WEB</span>
        <h2 style="font-size: 2.3rem; font-weight: 800; margin: 0.5rem 0 0.6rem 0; color: #fff;">ĐẶT VÉ BUFFET & VOUCHER GIÁ TỐT</h2>
        <div style="width: 70px; height: 4px; background: #e65f2b; margin: 0 auto; border-radius: 2px;"></div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 3rem;">
        <!-- Voucher Item 1 -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(230,95,43,0.15); border-radius: 20px; padding: 2rem; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; right: 0; background: #e65f2b; color: white; padding: 6px 20px; transform: rotate(45deg) translate(25px, -15px); font-size: 0.75rem; font-weight: 700; width: 100px; text-align: center;">Giảm 15%</div>
          <div>
            <h4 style="margin: 0 0 1rem 0; font-size: 1.3rem; color: #fff; font-weight: 800;">Vé Buffet Nướng & Lẩu Hải Sản</h4>
            <p style="color: #a8a096; line-height: 1.6; font-size: 0.95rem; margin-bottom: 1.5rem;">
              Thưởng thức không giới hạn thực đơn nướng BBQ với sườn heo, nạc vai bò Mỹ và lẩu hải sản cua ghẹ tươi ngon. Áp dụng cho mọi khung giờ.
            </p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.25rem;">
            <div>
              <span style="font-size: 1.5rem; font-weight: 900; color: #ff8c32;">450.000đ</span>
              <span style="font-size: 0.9rem; color: #64748b; text-decoration: line-through; margin-left: 0.5rem;">530.000đ</span>
            </div>
            <button class="add-to-cart-btn" data-product-id="ticket-1" data-product-name="Vé Buffet Nướng & Lẩu Hải Sản" data-product-price="450000" data-product-image="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600" style="background: #e65f2b; color: #fff; border: none; padding: 0.7rem 1.4rem; border-radius: 8px; font-weight: 700; cursor: pointer;">Đặt Vé Ngay</button>
          </div>
        </div>

        <!-- Voucher Item 2 -->
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(230,95,43,0.15); border-radius: 20px; padding: 2rem; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; right: 0; background: #ff8c32; color: #000; padding: 6px 20px; transform: rotate(45deg) translate(25px, -15px); font-size: 0.75rem; font-weight: 700; width: 100px; text-align: center;">Voucher</div>
          <div>
            <h4 style="margin: 0 0 1rem 0; font-size: 1.3rem; color: #fff; font-weight: 800;">E-Voucher Trị Giá 100.000đ</h4>
            <p style="color: #a8a096; line-height: 1.6; font-size: 0.95rem; margin-bottom: 1.5rem;">
              Voucher áp dụng trừ thẳng vào hóa đơn ăn uống trực tiếp tại nhà hàng. Có thể tích lũy sử dụng nhiều voucher cùng lúc trên một bàn ăn.
            </p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.25rem;">
            <div>
              <span style="font-size: 1.5rem; font-weight: 900; color: #ff8c32;">90.000đ</span>
              <span style="font-size: 0.9rem; color: #64748b; text-decoration: line-through; margin-left: 0.5rem;">100.000đ</span>
            </div>
            <button class="add-to-cart-btn" data-product-id="voucher-100" data-product-name="E-Voucher 100k" data-product-price="90000" data-product-image="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600" style="background: #e65f2b; color: #fff; border: none; padding: 0.7rem 1.4rem; border-radius: 8px; font-weight: 700; cursor: pointer;">Mua Voucher</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter Signup / Subscribe -->
  <section style="background: #0b0604; padding: 6rem 2rem; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto;">
      <h2 style="font-size: 2.2rem; font-weight: 800; color: #fff; margin-bottom: 1rem;">ĐĂNG KÝ THÀNH VIÊN GUSTO</h2>
      <p style="color: #a8a096; margin-bottom: 2.5rem; font-size: 1rem;">Nhận ngay mã giảm giá 10% cho lần đặt bàn tiếp theo và đặc quyền đặt phòng VIP miễn phí vào ngày sinh nhật.</p>
      <form style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
        <input type="email" placeholder="Nhập địa chỉ email của bạn" style="background: #18100e; border: 1px solid rgba(230,95,43,0.15); border-radius: 10px; padding: 0.9rem 1.5rem; color: #fff; flex: 1; min-width: 280px; outline: none; font-size: 1rem;" />
        <button type="button" style="background: #e65f2b; color: #fff; border: none; border-radius: 10px; padding: 0.9rem 2.2rem; font-weight: 700; cursor: pointer; font-size: 1rem;">Đăng Ký</button>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer style="background: #070302; padding: 5rem 2rem; color: #a8a096; font-size: 0.95rem; border-top: 1px solid rgba(230,95,43,0.08);">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4rem;">
      <div style="max-width: 400px;">
        <span style="font-size: 1.8rem; font-weight: 800; color: #fff; background: linear-gradient(135deg, #e65f2b, #ff8c32); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 1px;">GUSTO RESTO</span>
        <p style="margin-top: 1.2rem; line-height: 1.8; color: #c9c1b5;">Không gian ẩm thực tinh hoa đẳng cấp, kết nối những giá trị ẩm thực truyền thống và hiện đại ngay giữa trung tâm thương mại sầm uất.</p>
      </div>
      <div>
        <h4 style="color: #fff; margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 700;">Liên Hệ Đặt Bàn</h4>
        <p style="margin: 0.5rem 0;">Email: reservation@gusto.vn</p>
        <p style="margin: 0.5rem 0;">Hotline: 1900 8899</p>
        <p style="margin: 0.5rem 0;">Địa chỉ: Gian hàng L4-10, TTTM Megamall</p>
      </div>
      <div>
        <h4 style="color: #fff; margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 700;">Giờ Mở Cửa</h4>
        <p style="margin: 0.5rem 0;">Ngày thường: 10:00 AM - 10:00 PM</p>
        <p style="margin: 0.5rem 0;">Cuối tuần & Lễ: 09:30 AM - 10:30 PM</p>
      </div>
    </div>
    <div style="text-align: center; margin-top: 2.5rem; color: #64748b;">
      <p style="margin: 0;">&copy; 2026 GUSTO RESTO. Toàn bộ quyền sở hữu được bảo lưu.</p>
    </div>
  </footer>

  <!-- Floating Customer Support Widget Bubble -->
  <button class="customer-support-btn" style="position: fixed; bottom: 30px; right: 30px; background: linear-gradient(135deg, #e65f2b, #ff8c32); border: none; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; color: #fff; cursor: pointer; box-shadow: 0 5px 25px rgba(230,95,43,0.45); z-index: 4000;">
    <svg style="width: 28px; height: 28px; fill: currentColor;" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
  </button>
</div>
`;
