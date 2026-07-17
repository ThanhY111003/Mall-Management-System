import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs from 'grapesjs';
import webpagePlugin from 'grapesjs-preset-webpage';
import 'grapesjs/dist/css/grapes.min.css';
import { sportsStoreTemplate } from './templates/sportsStoreTemplate.js';
import { foodStoreTemplate } from './templates/foodStoreTemplate.js';

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