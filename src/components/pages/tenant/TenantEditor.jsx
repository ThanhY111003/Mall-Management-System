import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs from 'grapesjs';
import webpagePlugin from 'grapesjs-preset-webpage';
import 'grapesjs/dist/css/grapes.min.css';
import { sportsStoreTemplate } from './templates/sportsStoreTemplate.js';
import { foodStoreTemplate } from './templates/foodStoreTemplate.js';
import { authFetch } from '../../../utils/csrf.js';

export default function TenantEditor() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  
  const [brandName, setBrandName] = useState('');
  const [emailContact, setEmailContact] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const editorRef = useRef(null);

  useEffect(() => {
    // 1. Fetch existing config
    authFetch(`/api/tenant/config/${shopId}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setBrandName(data.brandName || 'NEO-SPORT');
          setEmailContact(data.emailContact || 'contact@neo-sport.vn');
          
          // Initialize editor with loaded data
          initEditor(data.websiteConfig ? JSON.parse(data.websiteConfig) : null);
        } else {
          // Initialize empty editor
          setBrandName('NEO-SPORT');
          setEmailContact('contact@neo-sport.vn');
          initEditor(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Lỗi khi tải cấu hình sạp hàng.');
        initEditor(null);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, [shopId]);

  const initEditor = (projectData) => {
    if (editorRef.current) return;

    try {
      const editor = grapesjs.init({
        container: '#gjs',
        height: 'calc(100vh - 75px)',
        width: 'auto',
        storageManager: { type: 'none' },
        plugins: [webpagePlugin],
        pluginsOpts: {
          [webpagePlugin]: {},
        },
      });

      // Register custom blocks for code-free editing
      const bm = editor.BlockManager;

      // 1. Hero Section Block
      bm.add('hero-section', {
        label: 'Banner Giới Thiệu',
        category: 'Khung Bố Cục',
        attributes: { class: 'gjs-fonts gjs-f-hero' },
        content: `
          <section style="padding: 80px 20px; background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%); text-align: center; color: white; border-radius: 16px; margin: 20px auto; max-width: 1100px;">
            <h1 style="font-size: 2.75rem; font-weight: 800; margin-bottom: 20px; font-family: 'Outfit', sans-serif; letter-spacing: -1px;">Chào Mừng Đến Với Cửa Hàng</h1>
            <p style="font-size: 1.1rem; color: #cbd5e1; max-width: 600px; margin: 0 auto 30px auto; line-height: 1.6; font-family: 'Outfit', sans-serif;">Khám phá các sản phẩm chất lượng cao nhất và dịch vụ chăm sóc khách hàng hàng đầu của chúng tôi.</p>
            <a href="#" class="book-table-btn" style="background: linear-gradient(135deg, #f43f5e 0%, #fb7185 100%); color: white; text-decoration: none; padding: 12px 32px; border-radius: 50px; font-weight: 700; display: inline-block; box-shadow: 0 10px 20px rgba(244,63,94,0.3); font-family: 'Outfit', sans-serif; transition: all 0.3s ease;">Đặt Chỗ / Mua Hàng</a>
          </section>
        `
      });

      // 2. About Us Block
      bm.add('about-section', {
        label: 'Giới Thiệu Sạp Hàng',
        category: 'Khung Bố Cục',
        attributes: { class: 'gjs-fonts gjs-f-b1' },
        content: `
          <section style="padding: 60px 20px; display: flex; flex-wrap: wrap; gap: 40px; align-items: center; max-width: 1100px; margin: 0 auto; color: white; font-family: 'Outfit', sans-serif;">
            <div style="flex: 1 1 450px; min-width: 300px;">
              <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 20px; color: #f43f5e;">Về Chúng Tôi</h2>
              <p style="font-size: 1rem; color: #9ca3af; line-height: 1.7; margin-bottom: 20px;">Chúng tôi cam kết mang tới cho khách hàng những trải nghiệm tuyệt vời nhất với đội ngũ nhân sự tận tâm, chuyên nghiệp cùng các dòng sản phẩm chọn lọc chính hãng cao cấp.</p>
              <p style="font-size: 1rem; color: #9ca3af; line-height: 1.7;">Sự hài lòng của quý khách chính là động lực phát triển lớn nhất của chúng tôi mỗi ngày.</p>
            </div>
            <div style="flex: 1 1 450px; min-width: 300px; height: 320px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; display: flex; align-items: center; justify-content: center; color: #64748b; font-weight: 600;">
              [ Kéo thả ảnh giới thiệu vào đây ]
            </div>
          </section>
        `
      });

      // 3. Contact Footer Block
      bm.add('contact-footer', {
        label: 'Thông Tin Liên Hệ',
        category: 'Khung Bố Cục',
        attributes: { class: 'gjs-fonts gjs-f-b3' },
        content: `
          <footer style="padding: 50px 20px; background: #0f172a; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; color: #9ca3af; font-family: 'Outfit', sans-serif; border-radius: 16px; margin-top: 50px;">
            <div style="max-width: 800px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-around; gap: 30px; margin-bottom: 30px;">
              <div>
                <h4 style="color: white; margin-bottom: 10px; font-weight: 700;">Địa Chỉ</h4>
                <p style="margin: 0; font-size: 0.9rem;">Gian hàng số 101, Tầng 1 Trung tâm Thương Mại Megamall</p>
              </div>
              <div>
                <h4 style="color: white; margin-bottom: 10px; font-weight: 700;">Giờ Mở Cửa</h4>
                <p style="margin: 0; font-size: 0.9rem;">Thứ Hai - Chủ Nhật: 09:00 AM - 10:00 PM</p>
              </div>
              <div>
                <h4 style="color: white; margin-bottom: 10px; font-weight: 700;">Hỗ Trợ</h4>
                <p style="margin: 0; font-size: 0.9rem;">Email: contact@tensaphang.vn</p>
              </div>
            </div>
            <p style="font-size: 0.8rem; color: #475569; margin: 0;">© 2026 Bản Quyền Thuộc Về Cửa Hàng. Thiết Kế Trên Hệ Thống Mall Management System.</p>
          </footer>
        `
      });

      // 4. Dynamic Product Grid Block
      bm.add('product-grid', {
        label: 'Lưới Sản Phẩm (Tự Động)',
        category: 'Nghiệp Vụ Cửa Hàng',
        attributes: { class: 'gjs-fonts gjs-f-image' },
        content: `
          <div id="dynamic-products-container" style="padding: 40px 0; min-height: 200px; background: rgba(255,255,255,0.01); border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-family: 'Outfit', sans-serif;">
            <div style="text-align: center;">
              <svg style="width: 48px; height: 48px; fill: rgba(255,255,255,0.2); margin-bottom: 10px;" viewBox="0 0 24 24">
                <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
              </svg>
              <p style="margin: 0; font-weight: 600; font-size: 0.95rem;">Khu vực hiển thị sản phẩm tự động</p>
              <p style="margin: 5px 0 0 0; font-size: 0.8rem; color: #64748b;">(Hệ thống sẽ render danh sách sản phẩm thực tế của sạp tại đây)</p>
            </div>
          </div>
        `
      });

      // 5. Booking Button Block
      bm.add('booking-btn', {
        label: 'Nút Đặt Bàn (Mở Popup)',
        category: 'Nghiệp Vụ Cửa Hàng',
        attributes: { class: 'gjs-fonts gjs-f-button' },
        content: `
          <div style="text-align: center; margin: 15px 0;">
            <button class="book-table-btn" style="background: linear-gradient(135deg, #e65f2b 0%, #ff8c32 100%); color: white; border: none; border-radius: 12px; padding: 14px 35px; font-size: 1rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(230,95,43,0.35); font-family: 'Outfit', sans-serif; transition: all 0.3s;">Đặt Bàn Ngay</button>
          </div>
        `
      });

      // 6. Support Chat Button Block
      bm.add('chat-support-btn', {
        label: 'Nút Chat Hỗ Trợ (Online)',
        category: 'Nghiệp Vụ Cửa Hàng',
        attributes: { class: 'gjs-fonts gjs-f-chat' },
        content: `
          <div style="text-align: center; margin: 15px 0;">
            <button class="customer-support-btn" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; border: none; border-radius: 12px; padding: 14px 35px; font-size: 1rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 15px rgba(99,102,241,0.35); font-family: 'Outfit', sans-serif; transition: all 0.3s; display: inline-flex; align-items: center; gap: 8px;">
              <svg style="width: 18px; height: 18px; fill: currentColor;" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
              Nhắn Tin Hỗ Trợ
            </button>
          </div>
        `
      });

      if (projectData) {
        editor.loadProjectData(projectData);
      } else {
        // Set basic starter template with sports shop
        editor.setComponents(sportsStoreTemplate);
      }

      editorRef.current = editor;
    } catch (e) {
      console.error('Error initializing GrapesJS:', e);
    }
  };

  const applySportsTemplate = () => {
    if (!editorRef.current) return;
    const confirm = window.confirm("Bạn có chắc chắn muốn áp dụng mẫu Giày & Quần Áo Thể Thao? Thiết kế hiện tại trong khung soạn thảo sẽ bị thay thế.");
    if (confirm) {
      editorRef.current.setComponents(sportsStoreTemplate);
      setBrandName('NEO-SPORT');
      setEmailContact('contact@neo-sport.vn');
    }
  };

  const applyFoodTemplate = () => {
    if (!editorRef.current) return;
    const confirm = window.confirm("Bạn có chắc chắn muốn áp dụng mẫu Nhà Hàng & Đồ Ăn? Thiết kế hiện tại trong khung soạn thảo sẽ bị thay thế.");
    if (confirm) {
      editorRef.current.setComponents(foodStoreTemplate);
      setBrandName('GUSTO RESTO');
      setEmailContact('reservation@gusto.vn');
    }
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
    setSaving(true);
    setError('');

    const projectData = editorRef.current.getProjectData();
    const payload = {
      shop: { id: parseInt(shopId, 10) },
      brandName: brandName,
      emailContact: emailContact,
      websiteConfig: JSON.stringify(projectData),
    };

    try {
      const res = await authFetch('/api/tenant/config/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Đã lưu thiết kế website cửa hàng thành công!');
      } else {
        const text = await res.text();
        setError(text || 'Không thể lưu cấu hình.');
      }
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi hệ thống khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#111827' }}>
      {/* Control Toolbar */}
      <div style={{
        height: '75px',
        background: '#0b0f19',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-secondary" 
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            ← Quay Lại
          </button>
          <div style={{ height: '24px', width: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem', background: 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Thiết Kế Web Shop #{shopId}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, justifyItems: 'center', justifyContent: 'center', maxWidth: '600px', margin: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '50%' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Tên Thương Hiệu:</span>
            <input 
              type="text" 
              placeholder="Tên shop của bạn..." 
              value={brandName} 
              onChange={(e) => setBrandName(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '50%' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Email Liên Hệ:</span>
            <input 
              type="email" 
              placeholder="email@example.com" 
              value={emailContact} 
              onChange={(e) => setEmailContact(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={applySportsTemplate} 
            className="btn" 
            style={{ 
              padding: '0.5rem 1.25rem', 
              fontSize: '0.9rem', 
              background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', 
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(244, 63, 94, 0.3)'
            }}
            disabled={saving}
          >
            Mẫu Thể Thao
          </button>
          <button 
            onClick={applyFoodTemplate} 
            className="btn" 
            style={{ 
              padding: '0.5rem 1.25rem', 
              fontSize: '0.9rem', 
              background: 'linear-gradient(135deg, #e65f2b 0%, #ff8c32 100%)', 
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(230, 95, 43, 0.3)'
            }}
            disabled={saving}
          >
            Mẫu Nhà Hàng
          </button>
          <button 
            onClick={handleSave} 
            className="btn btn-success" 
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
            disabled={saving}
          >
            {saving ? 'Đang lưu...' : 'Lưu Thiết Kế'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--color-danger)', color: '#fff', padding: '0.5rem 1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* GrapesJS editor container */}
      {loading && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
          Đang khởi tạo trình thiết kế website...
        </div>
      )}
      <div id="gjs" style={{ flex: 1, background: '#1e293b', display: loading ? 'none' : 'block' }}></div>
    </div>
  );
}