import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import grapesjs from 'grapesjs';
import webpagePlugin from 'grapesjs-preset-webpage';
import 'grapesjs/dist/css/grapes.min.css';

export default function ShopViewer({ shopId: propShopId }) {
  const { shopId: routeShopId } = useParams();
  const shopId = propShopId || routeShopId;

  // Configuration States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shopConfig, setShopConfig] = useState(null);
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');

  // Interactive Shopping States
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('41');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Checkout Form States
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Food Court & Restaurant Specific States
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Real-time Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [clientId, setClientId] = useState(() => {
    let id = sessionStorage.getItem('chat_client_id');
    if (!id) {
      id = 'client_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('chat_client_id', id);
    }
    return id;
  });

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Booking Form States
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingGuests, setBookingGuests] = useState('2');
  const [bookingNotes, setBookingNotes] = useState('');

  // Dynamic WebSocket URL generator based on environment
  const getWebSocketUrl = () => {
    const loc = window.location;
    const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    if (loc.port === '5173') {
      return `${protocol}//${loc.hostname}:8080/chat-ws`;
    }
    return `${protocol}//${loc.host}/chat-ws`;
  };

  // WebSocket Chat Client logic for Customer
  useEffect(() => {
    if (!isChatOpen) return;

    const isGusto = shopConfig?.brandName === 'GUSTO RESTO';

    // 1. Fetch Chat History
    fetch(`/api/public/chat/history/${shopId}/${clientId}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (data.length === 0) {
          setChatMessages([
            {
              sender: 'TENANT',
              content: isGusto 
                ? 'Xin chào! Gusto Resto có thể giúp gì cho bạn hôm nay? Bạn có thể hỏi về thực đơn, đặt bàn, khuyến mãi hoặc giờ mở cửa nhé!' 
                : 'Xin chào! Cám ơn bạn đã ghé thăm cửa hàng. Bạn cần hỗ trợ tư vấn chọn sản phẩm hay chương trình khuyến mãi nào không ạ?',
              timestamp: new Date().toISOString()
            }
          ]);
        } else {
          setChatMessages(data);
        }
      })
      .catch(err => console.error('Error fetching customer chat history:', err));

    // 2. Connect WebSocket
    const wsUrl = `${getWebSocketUrl()}?shopId=${shopId}&clientId=${clientId}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('>>> WebSocket: Connected customer chat');
    };

    socket.onmessage = (event) => {
      try {
        const incomingMsg = JSON.parse(event.data);
        setChatMessages(prev => {
          if (prev.some(m => m.id === incomingMsg.id)) {
            return prev;
          }
          return [...prev, incomingMsg];
        });
      } catch (err) {
        console.error('Error parsing incoming chat message:', err);
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket customer error:', err);
    };

    socket.onclose = () => {
      console.log('<<< WebSocket: Disconnected customer chat');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [isChatOpen, shopId, clientId, shopConfig]);

  // Scroll to bottom on new messages in chat drawer
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Load config data and parse HTML/CSS
  useEffect(() => {
    setLoading(true);
    setError('');

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
          const tempDiv = document.createElement('div');
          tempDiv.id = 'temp-gjs-parser';
          tempDiv.style.display = 'none';
          document.body.appendChild(tempDiv);

          try {
            const parser = grapesjs.init({
              container: '#temp-gjs-parser',
              storageManager: { type: 'none' },
              plugins: [webpagePlugin],
            });

            parser.loadProjectData(JSON.parse(data.websiteConfig));
            
            const compiledHtml = parser.getHtml();
            const compiledCss = parser.getCss();

            setHtml(compiledHtml);
            setCss(compiledCss);

            parser.destroy();
            document.body.removeChild(tempDiv);
          } catch (e) {
            console.error('Error parsing GrapesJS template:', e);
            if (document.getElementById('temp-gjs-parser')) {
              document.body.removeChild(tempDiv);
            }
            throw new Error('Lỗi khi biên dịch giao diện sạp hàng.');
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Lỗi hệ thống khi tải trang shop.');
        setLoading(false);
      });
  }, [shopId]);

  // Sync Cart Counter Badge with GrapesJS HTML Header Icon
  useEffect(() => {
    const badge = document.getElementById('cart-count-badge');
    if (badge) {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      badge.innerText = totalItems.toString();
    }
  }, [cart, html]);

  // Format currency helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Toast notifier
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  // Add to cart helper
  const addToCart = (id, name, price, image, size = 'Mặc định') => {
    setCart((prevCart) => {
      const itemKey = `${id}-${size}`;
      const existingItem = prevCart.find((item) => `${item.id}-${item.size}` === itemKey);
      if (existingItem) {
        return prevCart.map((item) =>
          `${item.id}-${item.size}` === itemKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { id, name, price, image, size, quantity: 1 }];
    });
    showToast(`Đã thêm ${name} vào đơn hàng!`);
  };

  // Modify cart item quantity
  const updateQuantity = (id, size, delta) => {
    setCart((prevCart) => {
      const itemKey = `${id}-${size}`;
      return prevCart
        .map((item) => {
          if (`${item.id}-${item.size}` === itemKey) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  // Remove from cart
  const removeFromCart = (id, size) => {
    const itemKey = `${id}-${size}`;
    setCart((prevCart) => prevCart.filter((item) => `${item.id}-${item.size}` !== itemKey));
  };

  // Intercept events inside raw HTML canvas
  const handleCanvasClick = (e) => {
    // 1. Detect view cart icon click in header
    const cartBtn = e.target.closest('.view-cart-btn');
    if (cartBtn) {
      e.preventDefault();
      setIsCartOpen(true);
      return;
    }

    // 2. Detect "Add to Cart" button click on products grid
    const addToCartBtn = e.target.closest('.add-to-cart-btn');
    if (addToCartBtn) {
      e.preventDefault();
      e.stopPropagation();
      
      const id = addToCartBtn.getAttribute('data-product-id');
      const name = addToCartBtn.getAttribute('data-product-name');
      const price = parseInt(addToCartBtn.getAttribute('data-product-price'), 10);
      const image = addToCartBtn.getAttribute('data-product-image');

      addToCart(id, name, price, image);
      return;
    }

    // 3. Detect "Book Table" button click
    const bookTableBtn = e.target.closest('.book-table-btn');
    if (bookTableBtn) {
      e.preventDefault();
      setIsBookingOpen(true);
      return;
    }

    // 4. Detect Customer Support chat bubble click
    const supportBtn = e.target.closest('.customer-support-btn');
    if (supportBtn) {
      e.preventDefault();
      setIsChatOpen(prev => !prev);
      return;
    }

    // 5. Detect product card click (excluding direct add-to-cart click)
    const productCard = e.target.closest('.product-card');
    if (productCard) {
      e.preventDefault();
      const id = productCard.getAttribute('data-product-id');
      const name = productCard.getAttribute('data-product-name');
      const price = parseInt(productCard.getAttribute('data-product-price'), 10);
      const image = productCard.getAttribute('data-product-image');
      const desc = productCard.getAttribute('data-product-desc') || 'Sản phẩm thuộc thực đơn đặc sắc mới nhất, chế biến công phu bởi đầu bếp 5 sao của nhà hàng.';

      setActiveProduct({ id, name, price, image, desc });
      setSelectedSize('41'); // default size for shoes (ignored for food)
      return;
    }
  };

  // Submit checkout order
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert('Vui lòng điền đầy đủ thông tin giao nhận hàng!');
      return;
    }

    setIsCheckoutOpen(false);
    setCheckoutSuccess(true);
    setCart([]); // Clear cart
  };

  // Submit Table Booking Reservation
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingName || !bookingPhone || !bookingDate || !bookingTime) {
      alert('Vui lòng điền đầy đủ thông tin liên hệ và lịch đặt bàn!');
      return;
    }

    setIsBookingOpen(false);
    setBookingSuccess(true);
  };

  // Chat message submission via WebSocket
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;

    if (socketRef.current.readyState !== WebSocket.OPEN) {
      alert('Kết nối đang bị gián đoạn, vui lòng thử lại sau giây lát!');
      return;
    }

    const payload = {
      content: chatInput.trim()
    };

    socketRef.current.send(JSON.stringify(payload));
    setChatInput('');
  };

  // Calculate cart subtotal
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Dynamic Theme Values based on Tenant Brand Name
  const isGusto = shopConfig?.brandName === 'GUSTO RESTO';
  const hasSupportBtnInHtml = html.includes('customer-support-btn');
  const primaryColor = isGusto ? '#e65f2b' : '#f43f5e';
  const primaryGradient = isGusto 
    ? 'linear-gradient(135deg, #e65f2b 0%, #ff8c32 100%)' 
    : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)';
  const glowShadow = isGusto 
    ? '0 4px 15px rgba(230, 95, 43, 0.35)' 
    : '0 4px 15px rgba(244, 63, 94, 0.3)';

  // If loading spinner
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0b0f19', color: '#fff' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Đang tải website cửa hàng...</div>
      </div>
    );
  }

  // Fallback Placeholder if not configured
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
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          border: '1px solid rgba(255,255,255,0.08)'
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
            <svg style={{ width: '40px', height: '40px', fill: '#6366f1' }} viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f9fafb' }}>
            {shopConfig?.brandName || 'Cửa Hàng Chưa Thiết Kế'}
          </h2>
          
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Website của sạp hàng này hiện đang được hoàn thiện. Vui lòng quay lại sau!
          </p>

          {shopConfig?.emailContact && (
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              padding: '0.75rem 1rem', 
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.85rem',
              color: '#9ca3af'
            }}>
              Liên hệ: <a href={`mailto:${shopConfig.emailContact}`} style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>{shopConfig.emailContact}</a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', position: 'relative', overflowX: 'hidden', scrollBehavior: 'smooth', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      
      {/* Dynamic Styling */}
      <style>{css}</style>
      <style>{`
        /* Extra styles for interactive React overlays */
        .toast-notif {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: ${isGusto ? 'linear-gradient(135deg, #e65f2b, #ff8c32)' : 'linear-gradient(135deg, #10b981, #059669)'};
          color: white;
          padding: 0.85rem 1.75rem;
          border-radius: 30px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          font-weight: 600;
          z-index: 10000;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
          from { top: -50px; opacity: 0; }
          to { top: 20px; opacity: 1; }
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(11, 15, 25, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 5000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1.5rem;
        }
        .cart-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: 450px;
          background: #0f172a;
          box-shadow: -10px 0 30px rgba(0,0,0,0.5);
          z-index: 6000;
          display: flex;
          flex-direction: column;
          border-left: 1px solid rgba(255,255,255,0.08);
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .form-input {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: white;
          width: 100%;
          outline: none;
          font-size: 0.95rem;
          margin-top: 0.4rem;
        }
        .form-input:focus {
          border-color: ${primaryColor};
        }
        .chat-box-container {
          position: fixed;
          bottom: 100px;
          right: 30px;
          width: 380px;
          height: 500px;
          background: #130a07;
          border: 1px solid rgba(230,95,43,0.25);
          border-radius: 20px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.5);
          z-index: 5500;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: floatUp 0.25s ease-out;
        }
        @keyframes floatUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Raw HTML Canvas Container */}
      <div onClick={handleCanvasClick} dangerouslySetInnerHTML={{ __html: html }} />

      {/* Floating Chat Bubble Button Fallback (only if NOT present in raw GrapesJS HTML and Chat is closed) */}
      {!isChatOpen && !hasSupportBtnInHtml && (
        <button 
          onClick={() => setIsChatOpen(true)}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            background: primaryGradient,
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: glowShadow,
            zIndex: 4000,
            transition: 'all 0.3s'
          }}
        >
          <svg style={{ width: '28px', height: '28px', fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
          </svg>
        </button>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notif">
          <svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Interactive Chat Widget Overlay */}
      {isChatOpen && (
        <div className="chat-box-container">
          {/* Header */}
          <div style={{ background: primaryGradient, padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Chăm sóc khách hàng</h4>
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{isGusto ? 'Hỗ trợ đặt bàn & Thực đơn (Trực tuyến)' : 'Hỗ trợ tư vấn chọn sản phẩm (Trực tuyến)'}</span>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
          </div>

          {/* Messages Container */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: isGusto ? '#0e0806' : '#070a13' }}>
            {chatMessages.map((msg, index) => {
              const isMe = msg.sender === 'CUSTOMER';
              return (
                <div 
                  key={msg.id || index}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: isMe ? primaryColor : 'rgba(255,255,255,0.05)',
                    border: isMe ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    color: '#fff',
                    padding: '0.75rem 1rem',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}
                >
                  {msg.content}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChatMessage} style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.5rem', background: '#130a07' }}>
            <input 
              type="text" 
              placeholder="Nhập tin nhắn..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{ flex: 1, background: '#1e110c', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.6rem 1rem', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
            />
            <button 
              type="submit" 
              style={{ background: primaryColor, border: 'none', color: 'white', borderRadius: '10px', padding: '0.6rem 1.2rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Gửi
            </button>
          </form>
        </div>
      )}

      {/* Table Booking Modal */}
      {isBookingOpen && (
        <div className="modal-overlay" onClick={() => setIsBookingOpen(false)}>
          <div 
            style={{
              background: '#130a07',
              borderRadius: '24px',
              maxWidth: '550px',
              width: '100%',
              border: '1px solid rgba(230,95,43,0.2)',
              padding: '2.5rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsBookingOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#a8a096', fontSize: '1.8rem', cursor: 'pointer' }}
            >
              &times;
            </button>

            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Đặt Chỗ Tiệc & Bàn Ăn</h3>
            
            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#a8a096' }}>Họ và Tên Liên Hệ</label>
                <input 
                  type="text" 
                  className="form-input"
                  style={{ background: '#1c100b', borderColor: 'rgba(230,95,43,0.15)' }}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#a8a096' }}>Số Điện Thoại</label>
                <input 
                  type="tel" 
                  className="form-input"
                  style={{ background: '#1c100b', borderColor: 'rgba(230,95,43,0.15)' }}
                  placeholder="Ví dụ: 0987654321"
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#a8a096' }}>Ngày Đặt Bàn</label>
                  <input 
                    type="date" 
                    className="form-input"
                    style={{ background: '#1c100b', borderColor: 'rgba(230,95,43,0.15)' }}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#a8a096' }}>Giờ Đặt</label>
                  <input 
                    type="time" 
                    className="form-input"
                    style={{ background: '#1c100b', borderColor: 'rgba(230,95,43,0.15)' }}
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#a8a096' }}>Số Khách</label>
                  <select 
                    className="form-input"
                    style={{ background: '#1c100b', borderColor: 'rgba(230,95,43,0.15)', height: '40px' }}
                    value={bookingGuests}
                    onChange={(e) => setBookingGuests(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <option key={n} value={n.toString()}>{n} người</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#a8a096' }}>Yêu Cầu Đặc Biệt (Ghi chú)</label>
                <textarea 
                  className="form-input"
                  style={{ background: '#1c100b', borderColor: 'rgba(230,95,43,0.15)', resize: 'none' }}
                  placeholder="Ví dụ: Cần không gian yên tĩnh, trang trí sinh nhật, phòng VIP,..."
                  rows="2"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                style={{
                  background: primaryGradient,
                  border: 'none',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: glowShadow,
                  marginTop: '0.5rem'
                }}
              >
                Gửi Yêu Cầu Đặt Bàn
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking Success Screen */}
      {bookingSuccess && (
        <div className="modal-overlay" onClick={() => setBookingSuccess(false)}>
          <div 
            style={{
              background: '#130a07',
              borderRadius: '24px',
              maxWidth: '450px',
              width: '100%',
              border: '1px solid rgba(230,95,43,0.2)',
              padding: '2.5rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <svg style={{ width: '40px', height: '40px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>

            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>Đặt Bàn Thành Công!</h3>
              <p style={{ color: '#a8a096', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Yêu cầu đặt chỗ của bạn đã được tiếp nhận. Bộ phận Reservation của <strong>{shopConfig?.brandName || 'GUSTO RESTO'}</strong> sẽ gọi điện xác nhận lại trong vòng 5-10 phút.
              </p>
            </div>

            <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', textAlign: 'left', fontSize: '0.9rem', color: '#64748b' }}>
              <p style={{ margin: '0.3rem 0' }}>Khách hàng: <strong style={{ color: 'white' }}>{bookingName}</strong></p>
              <p style={{ margin: '0.3rem 0' }}>Số điện thoại: <strong style={{ color: 'white' }}>{bookingPhone}</strong></p>
              <p style={{ margin: '0.3rem 0' }}>Lịch đặt: <strong style={{ color: 'white' }}>{bookingDate} vào lúc {bookingTime}</strong></p>
              <p style={{ margin: '0.3rem 0' }}>Số người: <strong style={{ color: 'white' }}>{bookingGuests} người</strong></p>
              {bookingNotes && <p style={{ margin: '0.3rem 0' }}>Ghi chú: <strong style={{ color: 'white' }}>{bookingNotes}</strong></p>}
            </div>

            <button 
              onClick={() => setBookingSuccess(false)}
              style={{
                width: '100%',
                background: primaryGradient,
                border: 'none',
                color: 'white',
                padding: '0.85rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: glowShadow
              }}
            >
              Tiếp Tục
            </button>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {activeProduct && (
        <div className="modal-overlay" onClick={() => setActiveProduct(null)}>
          <div 
            style={{
              background: isGusto ? '#130a07' : '#0f172a',
              borderRadius: '24px',
              maxWidth: '800px',
              width: '100%',
              border: isGusto ? '1px solid rgba(230,95,43,0.18)' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              display: 'flex',
              flexWrap: 'wrap',
              overflow: 'hidden',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setActiveProduct(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              &times;
            </button>

            {/* Product Image Panel */}
            <div style={{ flex: '1 1 350px', background: isGusto ? '#070302' : '#070a13', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', minHeight: '300px' }}>
              <img src={activeProduct.image} alt={activeProduct.name} style={{ width: '90%', height: 'auto', objectFit: 'contain', maxHeight: '350px', borderRadius: isGusto ? '12px' : '0' }} />
            </div>

            {/* Product Purchase Panel */}
            <div style={{ flex: '1 1 350px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <span style={{ color: primaryColor, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Chi Tiết</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', margin: 0 }}>{activeProduct.name}</h2>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: isGusto ? '#ff8c32' : '#fb7185' }}>{formatPrice(activeProduct.price)}</span>
              
              <p style={{ color: isGusto ? '#c9c1b5' : '#94a3b8', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>{activeProduct.desc}</p>

              {/* Sizes Selector (footwear ONLY - hidden for food, vouchers, and tickets) */}
              {!activeProduct.id.toString().startsWith('food') && !activeProduct.id.toString().startsWith('ticket') && !activeProduct.id.toString().startsWith('voucher') && (
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.75rem' }}>Chọn Kích Thước (Size)</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['39', '40', '41', '42', '43'].map((size) => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: selectedSize === size ? primaryColor : 'rgba(255,255,255,0.05)',
                          border: selectedSize === size ? `1px solid ${primaryColor}` : '1px solid rgba(255,255,255,0.1)',
                          color: 'white',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Checkout Details Add Button */}
              <button 
                onClick={() => {
                  const sizeLabel = (!activeProduct.id.toString().startsWith('food') && !activeProduct.id.toString().startsWith('ticket') && !activeProduct.id.toString().startsWith('voucher'))
                    ? selectedSize 
                    : 'Mặc định';
                  addToCart(activeProduct.id, activeProduct.name, activeProduct.price, activeProduct.image, sizeLabel);
                  setActiveProduct(null);
                }}
                style={{
                  background: primaryGradient,
                  border: 'none',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: glowShadow,
                  marginTop: '1rem'
                }}
              >
                {isGusto ? 'Thêm Vào Đơn Hàng' : 'Thêm Vào Giỏ Hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5500 }} onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" style={{ background: isGusto ? '#130a07' : '#0f172a', borderColor: isGusto ? 'rgba(230,95,43,0.15)' : 'rgba(255,255,255,0.08)' }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: isGusto ? '1px solid rgba(230,95,43,0.15)' : '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>{isGusto ? 'Đơn Hàng Của Bạn' : 'Giỏ Hàng Của Bạn'}</h3>
              <button 
                onClick={() => setIsCartOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.75rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {/* Item List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: isGusto ? '#0b0604' : '#0f172a' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                  <svg style={{ width: '48px', height: '48px', fill: 'currentColor', marginBottom: '1rem' }} viewBox="0 0 24 24">
                    <path d="M17.21 9l-4.38-6.56c-.18-.27-.51-.44-.83-.44-.32 0-.65.17-.83.44L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.88 1.46h13.08c.88 0 1.65-.62 1.88-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1h-4.79zM9 9l3-4.5L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                  </svg>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>{isGusto ? 'Chưa có món ăn nào được chọn' : 'Giỏ hàng của bạn đang trống'}</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={`${item.id}-${item.size}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '14px', border: isGusto ? '1px solid rgba(230,95,43,0.1)' : '1px solid rgba(255,255,255,0.04)' }}>
                    <img src={item.image} alt={item.name} style={{ width: '70px', height: '70px', objectFit: 'contain', background: isGusto ? '#070302' : '#070a13', borderRadius: '8px', padding: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'white', fontWeight: 600 }}>{item.name}</h4>
                      {item.size !== 'Mặc định' && <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '3px' }}>Size: {item.size}</span>}
                      <span style={{ fontSize: '0.9rem', color: isGusto ? '#ff8c32' : '#fb7185', fontWeight: 700, display: 'block', marginTop: '5px' }}>{formatPrice(item.price)}</span>
                    </div>
                    
                    {/* Quantity controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: isGusto ? '#1c100b' : '#1e293b', borderRadius: '6px', overflow: 'hidden' }}>
                        <button onClick={() => updateQuantity(item.id, item.size, -1)} style={{ background: 'none', border: 'none', color: 'white', padding: '4px 8px', cursor: 'pointer', fontSize: '0.85rem' }}>-</button>
                        <span style={{ color: 'white', padding: '0 6px', fontSize: '0.85rem', fontWeight: 600 }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, 1)} style={{ background: 'none', border: 'none', color: 'white', padding: '4px 8px', cursor: 'pointer', fontSize: '0.85rem' }}>+</button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.size)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', marginTop: '3px' }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Action */}
            {cart.length > 0 && (
              <div style={{ padding: '1.5rem', borderTop: isGusto ? '1px solid rgba(230,95,43,0.15)' : '1px solid rgba(255,255,255,0.08)', background: isGusto ? '#130a07' : '#0a0f1d' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <span style={{ color: '#64748b', fontSize: '1rem' }}>Tổng cộng:</span>
                  <span style={{ color: isGusto ? '#ff8c32' : '#fb7185', fontSize: '1.3rem', fontWeight: 800 }}>{formatPrice(subtotal)}</span>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  style={{
                    width: '100%',
                    background: primaryGradient,
                    border: 'none',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: glowShadow,
                    textAlign: 'center'
                  }}
                >
                  {isGusto ? 'Thanh Toán Đơn Hàng' : 'Tiến Hành Thanh Toán'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Dialog */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div 
            style={{
              background: isGusto ? '#130a07' : '#0f172a',
              borderRadius: '24px',
              maxWidth: '550px',
              width: '100%',
              border: isGusto ? '1px solid rgba(230,95,43,0.18)' : '1px solid rgba(255,255,255,0.1)',
              padding: '2.5rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#64748b', fontSize: '1.8rem', cursor: 'pointer' }}
            >
              &times;
            </button>

            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Thông Tin Giao Hàng & Thanh Toán</h3>
            
            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: isGusto ? '#a8a096' : '#94a3b8' }}>Họ và Tên Người Nhận</label>
                <input 
                  type="text" 
                  className="form-input"
                  style={{ background: isGusto ? '#1c100b' : '#1e293b', borderColor: isGusto ? 'rgba(230,95,43,0.15)' : 'rgba(255,255,255,0.1)' }}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: isGusto ? '#a8a096' : '#94a3b8' }}>Số Điện Thoại</label>
                <input 
                  type="tel" 
                  className="form-input"
                  style={{ background: isGusto ? '#1c100b' : '#1e293b', borderColor: isGusto ? 'rgba(230,95,43,0.15)' : 'rgba(255,255,255,0.1)' }}
                  placeholder="Ví dụ: 0987654321"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: isGusto ? '#a8a096' : '#94a3b8' }}>Địa Chỉ Nhận Hàng</label>
                <textarea 
                  className="form-input"
                  style={{ background: isGusto ? '#1c100b' : '#1e293b', borderColor: isGusto ? 'rgba(230,95,43,0.15)' : 'rgba(255,255,255,0.1)', resize: 'none' }}
                  placeholder={isGusto ? "Nhập địa chỉ nhà hoặc số bàn ăn nếu bạn đang ngồi tại trung tâm Megamall" : "Nhập địa chỉ chi tiết giao nhận (Số nhà, Tên đường...)"}
                  rows="3"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: isGusto ? '#a8a096' : '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Phương Thức Thanh Toán</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '0.95rem', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="COD" 
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                    />
                    {isGusto ? 'Thanh toán trực tiếp sau khi ăn xong (COD)' : 'Thanh toán khi nhận hàng (COD)'}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '0.95rem', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="BANK" 
                      checked={paymentMethod === 'BANK'}
                      onChange={() => setPaymentMethod('BANK')}
                    />
                    Chuyển khoản ngân hàng (Quét mã QR)
                  </label>
                </div>
              </div>

              {/* Order total info inside checkout */}
              <div style={{ margin: '0.5rem 0', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.95rem', color: '#64748b' }}>Tổng thanh toán:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: isGusto ? '#ff8c32' : '#fb7185' }}>{formatPrice(subtotal)}</span>
              </div>

              <button 
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
                  marginTop: '0.5rem'
                }}
              >
                Xác Nhận Đặt Hàng
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Success Screen */}
      {checkoutSuccess && (
        <div className="modal-overlay" onClick={() => setCheckoutSuccess(false)}>
          <div 
            style={{
              background: isGusto ? '#130a07' : '#0f172a',
              borderRadius: '24px',
              maxWidth: '450px',
              width: '100%',
              border: isGusto ? '1px solid rgba(230,95,43,0.18)' : '1px solid rgba(255,255,255,0.1)',
              padding: '2.5rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <svg style={{ width: '40px', height: '40px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>

            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>Đặt Hàng Thành Công!</h3>
              <p style={{ color: isGusto ? '#a8a096' : '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Cảm ơn bạn đã đặt món tại <strong>{shopConfig?.brandName || 'GUSTO RESTO'}</strong>. Đơn hàng của bạn đang được chế biến và sẽ sẵn sàng giao ngay.
              </p>
            </div>

            <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', textAlign: 'left', fontSize: '0.9rem', color: '#64748b' }}>
              <p style={{ margin: '0.3rem 0' }}>Khách hàng: <strong style={{ color: 'white' }}>{customerName}</strong></p>
              <p style={{ margin: '0.3rem 0' }}>Số điện thoại: <strong style={{ color: 'white' }}>{customerPhone}</strong></p>
              <p style={{ margin: '0.3rem 0' }}>Địa chỉ nhận món: <strong style={{ color: 'white' }}>{customerAddress}</strong></p>
              <p style={{ margin: '0.3rem 0' }}>Phương thức: <strong style={{ color: 'white' }}>{paymentMethod === 'COD' ? (isGusto ? 'Thanh toán tại quầy/bàn' : 'Thanh toán COD') : 'Chuyển khoản QR'}</strong></p>
            </div>

            <button 
              onClick={() => setCheckoutSuccess(false)}
              style={{
                width: '100%',
                background: primaryGradient,
                border: 'none',
                color: 'white',
                padding: '0.85rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: glowShadow
              }}
            >
              Tiếp Tục Mua Sắm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}