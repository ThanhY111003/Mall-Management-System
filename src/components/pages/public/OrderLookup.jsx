// src/components/pages/public/OrderLookup.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function OrderLookup() {
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shopId');

  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    if (shopId) {
      fetch(`/api/public/shop/${shopId}/config`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setShopName(data.shopName);
          }
        })
        .catch(err => console.error('Lỗi tải tên sạp:', err));
    }
  }, [shopId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    if (!shopId) {
      setError('Thiếu mã sạp hàng (shopId). Không thể tra cứu!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/public/orders/lookup?phone=${encodeURIComponent(phone.trim())}&shopId=${shopId}`);
      if (!res.ok) throw new Error(await res.text() || 'Không thể tra cứu đơn hàng.');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (s) => {
    if (s === 'PENDING') return 'Chờ duyệt';
    if (s === 'CONFIRMED') return 'Đã xác nhận';
    if (s === 'APPROVED') return 'Đã xác nhận'; // handle both APPROVED and CONFIRMED statuses
    return 'Đã hủy';
  };

  const statusColor = (s) => {
    if (s === 'PENDING') return '#f59e0b';
    if (s === 'CONFIRMED' || s === 'APPROVED') return '#10b981';
    return '#ef4444';
  };

  if (!shopId) {
    return (
      <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Lỗi Tra Cứu</h2>
          <p style={{ color: '#9ca3af' }}>Vui lòng truy cập trang tra cứu thông qua liên kết trực tiếp trên website của sạp hàng để kiểm tra đơn hàng chính xác.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#f9fafb', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Tra Cứu Đơn Hàng {shopName ? `— ${shopName}` : ''}
        </h1>
        <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Nhập số điện thoại đã dùng khi đặt hàng tại sạp để xem lại trạng thái đơn.</p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <input
            type="tel"
            placeholder="Nhập số điện thoại..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ flex: 1, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.75rem 1rem', color: 'white', outline: 'none' }}
          />
          <button type="submit" disabled={loading} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, padding: '0 1.5rem', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Đang tìm...' : 'Tra Cứu'}
          </button>
        </form>

        {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

        {orders !== null && (
          orders.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>Không tìm thấy đơn hàng nào với số điện thoại này tại sạp.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map(o => (
                <div key={o.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>Đơn #{o.id}</strong>
                    <span style={{ color: statusColor(o.status), fontWeight: 600, fontSize: '0.85rem' }}>{statusLabel(o.status)}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                    {o.paymentMethod === 'BOOKING' ? 'Đặt bàn' : 'Mua hàng'} · {new Date(o.createdAt).toLocaleString('vi-VN')}
                  </div>
                  {o.totalAmount > 0 && (
                    <div style={{ marginTop: '0.5rem', fontWeight: 700 }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
