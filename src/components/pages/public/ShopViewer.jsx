import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import grapesjs from 'grapesjs';
import webpagePlugin from 'grapesjs-preset-webpage';
import 'grapesjs/dist/css/grapes.min.css';

export default function ShopViewer({ shopId: propShopId }) {
  const { shopId: routeShopId } = useParams();
  const shopId = propShopId || routeShopId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shopConfig, setShopConfig] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError('');

    // Fetch public website config from backend
    fetch(`/api/public/shop/${shopId}/config`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Không tìm thấy cấu hình hoặc sạp chưa thiết kế.');
        }
        return res.json();
      })
      .then((data) => {
        setShopConfig(data);
        if (data.websiteConfig) {
          initViewer(JSON.parse(data.websiteConfig));
        } else {
          setLoading(false); // No config designed yet
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Lỗi hệ thống khi tải trang shop.');
        setLoading(false);
      });

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, [shopId]);

  const initViewer = (projectData) => {
    try {
      // Initialize GrapesJS in read-only mode, hiding all side panels and managers
      const viewer = grapesjs.init({
        container: '#viewer-canvas',
        height: '100vh',
        width: '100%',
        storageManager: { type: 'none' },
        panels: { defaults: [] }, // Disable default panels
        plugins: [webpagePlugin],
      });

      if (projectData) {
        viewer.loadProjectData(projectData);
      }

      // Disable selection and editing operations
      const wrapper = viewer.getWrapper();
      if (wrapper) {
        wrapper.set({ 
          selectable: false,
          hoverable: false,
          draggable: false,
          badgable: false,
          copyable: false,
          removable: false
        });
      }

      // Recursively disable actions on all components
      const disableComponents = (components) => {
        components.each(model => {
          model.set({
            selectable: false,
            hoverable: false,
            draggable: false,
            badgable: false,
            copyable: false,
            removable: false
          });
          if (model.components().length) {
            disableComponents(model.components());
          }
        });
      };
      disableComponents(viewer.getComponents());

      editorRef.current = viewer;
      setLoading(false);
    } catch (e) {
      console.error('Error rendering GrapesJS components:', e);
      setError('Đã xảy ra lỗi khi hiển thị thiết kế cửa hàng.');
      setLoading(false);
    }
  };

  // If loading
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0b0f19', color: '#fff' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Đang tải website cửa hàng...</div>
      </div>
    );
  }

  // If there's an error or no config exists yet, display a premium placeholder
  if (error || !shopConfig || !shopConfig.websiteConfig) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0b0f19',
        color: '#f9fafb',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div className="glass-panel glow-primary" style={{
          maxWidth: '500px',
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <svg style={{ width: '40px', height: '40px', fill: 'var(--color-primary)' }} viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f9fafb' }}>
            {shopConfig?.brandName || 'Cửa Hàng Chưa Thiết Kế'}
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Website của sạp hàng này hiện đang được hoàn thiện. Vui lòng quay lại sau!
          </p>

          {shopConfig?.emailContact && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              Liên hệ: <a href={`mailto:${shopConfig.emailContact}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>{shopConfig.emailContact}</a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Hide GrapesJS default toolbars using CSS injected on the page */}
      <style>{`
        .gjs-pn-panels { display: none !important; }
        .gjs-cv-canvas { width: 100% !important; height: 100% !important; top: 0 !important; left: 0 !important; }
        .gjs-cv-canvas__frames { width: 100% !important; height: 100% !important; }
        .gjs-frame { box-shadow: none !important; border: none !important; }
        .gjs-dashed * { outline: none !important; }
      `}</style>
      <div id="viewer-canvas" style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
}