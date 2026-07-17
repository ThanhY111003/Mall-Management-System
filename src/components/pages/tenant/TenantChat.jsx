import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function TenantChat() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  // Chat Data States
  const [conversations, setConversations] = useState([]);
  const [activeClientId, setActiveClientId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [brandName, setBrandName] = useState('Cửa Hàng');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Dynamic WebSocket URL generator based on environment
  const getWebSocketUrl = () => {
    const loc = window.location;
    const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    if (loc.port === '5173') {
      return `${protocol}//${loc.hostname}:8080/chat-ws`; // Direct to Spring Boot in dev
    }
    return `${protocol}//${loc.host}/chat-ws`; // Same origin in production
  };

  // 1. Load active conversations and shop details
  useEffect(() => {
    setLoading(true);
    setError('');

    // Fetch Shop Brand Name
    fetch(`/api/tenant/config/${shopId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.brandName) {
          setBrandName(data.brandName);
        }
      })
      .catch(err => console.error('Error fetching brand name:', err));

    // Fetch Unique Conversations List
    fetch(`/api/chat/conversations/${shopId}`)
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải danh sách cuộc trò chuyện.');
        return res.json();
      })
      .then(data => {
        setConversations(data);
        if (data.length > 0) {
          setActiveClientId(data[0]); // Select first conversation by default
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Lỗi khi tải cuộc trò chuyện.');
        setLoading(false);
      });
  }, [shopId]);

  // 2. Fetch messages history when active customer changes
  useEffect(() => {
    if (!activeClientId) return;

    fetch(`/api/chat/history/${shopId}/${activeClientId}`)
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải lịch sử tin nhắn.');
        return res.json();
      })
      .then(data => {
        setMessages(data);
      })
      .catch(err => console.error('Error fetching chat history:', err));

    // Mark conversation as read
    fetch(`/api/chat/mark-read/${shopId}/${activeClientId}`, {
      method: 'POST'
    }).catch(err => console.error('Error marking as read:', err));
  }, [shopId, activeClientId]);

  // 3. Set up WebSocket connection for Tenant
  useEffect(() => {
    const wsUrl = `${getWebSocketUrl()}?shopId=${shopId}&role=tenant`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('>>> WebSocket: Connected to tenant channel');
    };

    socket.onmessage = (event) => {
      try {
        const incomingMsg = JSON.parse(event.data);
        
        // If message is from a client who is not currently in conversations list, add them
        setConversations(prev => {
          if (!prev.includes(incomingMsg.clientId)) {
            return [incomingMsg.clientId, ...prev];
          }
          return prev;
        });

        // Append message to current chat if it belongs to the active conversation
        setMessages(prev => {
          // Prevent duplicates by checking id
          if (prev.some(m => m.id === incomingMsg.id)) {
            return prev;
          }
          if (incomingMsg.clientId === activeClientId) {
            fetch(`/api/chat/mark-read/${shopId}/${activeClientId}`, { method: 'POST' })
              .catch(err => console.error('Error marking as read:', err));
            return [...prev, incomingMsg];
          }
          return prev;
        });

      } catch (err) {
        console.error('Error parsing incoming message:', err);
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket Error:', err);
    };

    socket.onclose = () => {
      console.log('<<< WebSocket: Disconnected from tenant channel');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [shopId, activeClientId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle message send
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeClientId || !socketRef.current) return;

    if (socketRef.current.readyState !== WebSocket.OPEN) {
      alert('Kết nối WebSocket đang bị ngắt. Vui lòng reload trang!');
      return;
    }

    const payload = {
      clientId: activeClientId,
      content: inputMessage.trim()
    };

    socketRef.current.send(JSON.stringify(payload));
    setInputMessage('');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Determine dynamic accent color
  const isGusto = brandName === 'GUSTO RESTO';
  const accentColor = isGusto ? '#e65f2b' : '#6366f1';
  const accentGradient = isGusto 
    ? 'linear-gradient(135deg, #e65f2b 0%, #ff8c32 100%)' 
    : 'linear-gradient(135deg, #a5b4fc 0%, #6366f1 100%)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#0b0f19', color: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Control Header */}
      <div style={{
        height: '75px',
        background: '#0b0f19',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
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
          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontWeight: 700, fontSize: '1.1rem', background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Hộp Thư Chat - {brandName}
          </span>
        </div>
      </div>

      {/* Main Workspace */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#9ca3af' }}>
          Đang tải thông tin cuộc trò chuyện...
        </div>
      ) : error ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ef4444' }}>
          {error}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Left Panel: Active Conversations List */}
          <div style={{
            width: '320px',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            background: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Danh sách hội thoại
            </div>
            
            {conversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Chưa có cuộc trò chuyện nào được kết nối với cửa hàng.
              </div>
            ) : (
              conversations.map((clientId) => (
                <div 
                  key={clientId}
                  onClick={() => setActiveClientId(clientId)}
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    background: activeClientId === clientId ? 'rgba(255,255,255,0.03)' : 'transparent',
                    borderLeft: `4px solid ${activeClientId === clientId ? accentColor : 'transparent'}`,
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: activeClientId === clientId ? accentColor : '#94a3b8'
                  }}>
                    Kh
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: activeClientId === clientId ? 'white' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Khách hàng #{clientId.slice(-6)}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ID: {clientId.slice(0, 12)}...
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Panel: Active Chat Messages Log */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#070a13' }}>
            
            {activeClientId ? (
              <>
                {/* Chat header */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0b0f19', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Đang trò chuyện với: Khách hàng #{activeClientId}</span>
                </div>

                {/* Messages Panel */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                      Không có tin nhắn nào trong lịch sử.
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.sender === 'TENANT';
                      return (
                        <div 
                          key={msg.id || index}
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '65%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <div style={{
                            background: isMe ? accentColor : 'rgba(255,255,255,0.04)',
                            border: isMe ? 'none' : '1px solid rgba(255,255,255,0.06)',
                            color: 'white',
                            padding: '0.75rem 1.25rem',
                            borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            fontSize: '0.92rem',
                            lineHeight: '1.5',
                            wordBreak: 'break-word'
                          }}>
                            {msg.content}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', padding: '0 4px' }}>
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send input bar */}
                <form onSubmit={handleSendMessage} style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0b0f19', display: 'flex', gap: '0.75rem' }}>
                  <input 
                    type="text" 
                    placeholder="Gõ tin nhắn trả lời khách hàng..." 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    style={{
                      flex: 1,
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '0.75rem 1.25rem',
                      color: 'white',
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  />
                  <button 
                    type="submit"
                    style={{
                      background: accentGradient,
                      border: 'none',
                      color: 'white',
                      borderRadius: '10px',
                      padding: '0 1.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    Gửi
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b', fontSize: '1rem' }}>
                Chọn một hội thoại ở cột bên trái để bắt đầu nhắn tin.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
