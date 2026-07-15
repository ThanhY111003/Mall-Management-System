import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs from 'grapesjs';
import webpagePlugin from 'grapesjs-preset-webpage';
import 'grapesjs/dist/css/grapes.min.css';

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
    fetch(`/api/tenant/config/${shopId}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) {
          setBrandName(data.brandName || '');
          setEmailContact(data.emailContact || '');
          
          // Initialize editor with loaded data
          initEditor(data.websiteConfig ? JSON.parse(data.websiteConfig) : null);
        } else {
          // Initialize empty editor
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

      if (projectData) {
        editor.loadProjectData(projectData);
      } else {
        // Set basic starter template
        editor.setComponents(`
          <div style="padding: 50px; font-family: sans-serif; text-align: center; background-color: #f8fafc; color: #1e293b;">
            <h1 style="font-size: 3rem; margin-bottom: 10px; color: #6366f1;">Chào Mừng Đến Với Cửa Hàng</h1>
            <p style="font-size: 1.2rem; color: #64748b; max-width: 600px; margin: 0 auto 20px;">
              Chào mừng quý khách đến mua sắm! Chúng tôi chuyên cung cấp các sản phẩm chất lượng cao với dịch vụ tốt nhất.
            </p>
            <button style="background-color: #6366f1; color: white; border: none; padding: 12px 24px; font-size: 1rem; font-weight: bold; border-radius: 6px; cursor: pointer;">
              Xem Sản Phẩm
            </button>
          </div>
        `);
      }

      editorRef.current = editor;
    } catch (e) {
      console.error('Error initializing GrapesJS:', e);
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
      const res = await fetch('/api/tenant/config/update', {
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

        <div>
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