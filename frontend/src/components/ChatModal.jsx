// src/components/ChatModal.jsx
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
          <h3 className="text-lg font-semibold text-gray-800">Chat with {employeeName}</h3>
          <button type="button" className="text-gray-500 hover:text-gray-700" onClick={onClose}>×</button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {connecting && <div className="text-sm text-gray-500">Connecting…</div>}
          {messages.map((m) => (
            <div key={m.id || m.at} className={`flex ${m.from === 'owner' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${m.from === 'owner' ? 'bg-blue-600 text-white' : 'bg-white border'} max-w-[75%] px-3 py-2 rounded-lg text-sm shadow-sm`}>
                <div className="whitespace-pre-wrap break-words">{m.text}</div>
                <div className="text-[10px] opacity-70 mt-1">{new Date(m.at).toLocaleString()}</div>
              </div>
            </div>
          ))}
          {!messages.length && !connecting && (
            <div className="text-sm text-gray-500">No messages yet. Say hi 👋</div>
          )}
        </div>

        <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Type a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
