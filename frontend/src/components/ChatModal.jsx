import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL, getChatHistory } from '../service/api';

const ChatModal = ({ isOpen, employee, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const socketRef = useRef(null);
  const listRef = useRef(null);

  const employeeId = employee?.id;
  const employeeName = useMemo(() => employee?.name || 'Employee', [employee]);
  const employeeEmail = employee?.email || '';
  const employeeInitial = (employeeName?.[0] || '?').toUpperCase();


  const OWNER_NAME = useMemo(() => (process.env.REACT_APP_OWNER_NAME), []);
  const ownerInitial = (OWNER_NAME?.[0] || 'O').toUpperCase();

  useEffect(() => {
    if (!isOpen || !employeeId) return;

    let active = true;
    setConnecting(true);

    getChatHistory(employeeId)
      .then((h) => {
        if (!active) return;
        setMessages(Array.isArray(h) ? h : []);
      })
      .catch(() => {})
      .finally(() => setConnecting(false));

    const socket = io(API_BASE_URL, { autoConnect: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', { employeeId, role: 'owner' });
    });

    socket.on('chat:message', (msg) => {
      if (msg?.employeeId !== employeeId) return;
      setMessages((prev) => [...prev, { id: msg.id, from: msg.from, text: msg.text, at: msg.at }]);
    });

    return () => {
      active = false;
      try { socket.off('chat:message'); } catch {}
      try { socket.disconnect(); } catch {}
      socketRef.current = null;
    };
  }, [isOpen, employeeId]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  if (!isOpen || !employeeId) return null;

  const sendMessage = (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text) return;
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('chat:message', { employeeId, from: 'owner', text });
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-xl mx-4 flex flex-col h-[70vh]">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
              {employeeInitial}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{employeeName}</h3>
              {employeeEmail && <p className="text-xs text-gray-500">{employeeEmail}</p>}
            </div>
          </div>
          <button type="button" className="text-gray-500 hover:text-gray-700" onClick={onClose}>×</button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {connecting && <div className="text-sm text-gray-500">Connecting…</div>}
          {messages.map((m) => {
            const isOwner = m.from === 'owner';
            const senderLabel = isOwner ? OWNER_NAME : employeeName;
            const atStr = new Date(m.at).toLocaleString();
            return (
              <div key={m.id || m.at} className={`flex ${isOwner ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {!isOwner && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs">
                    {employeeInitial}
                  </div>
                )}
                <div className={`${isOwner ? 'bg-red-500 text-white' : 'bg-white border'} max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm`}>
                  <div className={`text-[11px] mb-1 ${isOwner ? 'text-white/80' : 'text-gray-500'}`}>{senderLabel} • {atStr}</div>
                  <div className="whitespace-pre-wrap break-words leading-relaxed">{m.text}</div>
                </div>
                {isOwner && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs">{ownerInitial}</div>
                )}
              </div>
            );
          })}
          {!messages.length && !connecting && (
            <div className="text-sm text-gray-500">No messages yet. Say hi 👋</div>
          )}
        </div>

        <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Type a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
