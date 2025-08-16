import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL, listEmployees, getChatHistory } from '../service/api';



const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const UserIcon = ({ className = "h-8 w-8 text-gray-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);


const MessagePage = () => {
    const [employees, setEmployees] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        let active = true;
        listEmployees()
            .then((list) => {
                if (!active) return;
                setEmployees(Array.isArray(list) ? list : []);
                
                if (Array.isArray(list) && list.length && !selected) {
                    setSelected(list[0]);
                }
            })
            .catch(() => {})
        return () => { active = false; };
    }, []);


    useEffect(() => {
        const socket = io(API_BASE_URL, { autoConnect: true });
        socketRef.current = socket;

        socket.on('connect', () => {
           
            if (selected?.id) {
                socket.emit('join', { employeeId: selected.id, role: 'owner' });
            }
        });

        socket.on('chat:message', (msg) => {
            if (!selected?.id || msg?.employeeId !== selected.id) return;
            setMessages((prev) => [...prev, { id: msg.id, from: msg.from, text: msg.text, at: msg.at }]);
        });

        return () => {
            try { socket.off('chat:message'); } catch {}
            try { socket.disconnect(); } catch {}
            socketRef.current = null;
        };
    }, []);

    
    useEffect(() => {
        if (!selected?.id) return;
        let active = true;
        setLoading(true);
        getChatHistory(selected.id)
            .then((h) => {
                if (!active) return;
                setMessages(Array.isArray(h) ? h : []);
            })
            .catch(() => setMessages([]))
            .finally(() => setLoading(false));

        const socket = socketRef.current;
        if (socket && socket.connected) {
            socket.emit('join', { employeeId: selected.id, role: 'owner' });
        }
        return () => { active = false; };
    }, [selected?.id]);

    useEffect(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages]);

    const handleSend = (e) => {
        e?.preventDefault?.();
        const text = input.trim();
        if (!text || !selected?.id) return;
        const socket = socketRef.current;
        if (!socket) return;
        socket.emit('chat:message', { employeeId: selected.id, from: 'owner', text });
        setInput('');
    };

    const selectedName = useMemo(() => selected?.name || 'Employee', [selected]);

    return (
        <div className="flex h-screen bg-white font-sans">
            
            <aside className="w-64 border-r border-gray-200">
                <div className="h-16 w-40 bg-gray-200 mt-6 ml-6 mb-10"></div>
                <nav className="px-6">
                    <ul>
                        <li>
                            <a href="#" className="flex items-center py-2.5 px-4 text-gray-600 hover:bg-gray-100 rounded">
                                Manage Task
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center py-2.5 px-4 bg-blue-50 text-blue-600 border-l-4 border-blue-500 font-semibold">
                                Message
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>

            
            <main className="flex-1 flex flex-col">
               
                <header className="flex justify-end items-center h-20 px-8 border-b border-gray-200">
                    <div className="relative">
                        <BellIcon />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                        </span>
                    </div>
                    <div className="ml-6">
                        <UserIcon className="h-9 w-9 text-gray-400 bg-gray-200 rounded-full p-1" />
                    </div>
                </header>

                
                <div className="flex flex-1 overflow-hidden p-8 gap-8">
                   
                    <div className="w-1/3 xl:w-1/4 space-y-3 overflow-y-auto pr-2">
                        {employees.map((emp) => (
                            <button
                                key={emp.id}
                                onClick={() => setSelected(emp)}
                                className={`w-full text-left bg-gray-100 p-4 rounded-xl cursor-pointer hover:bg-gray-200 ${selected?.id === emp.id ? 'ring-2 ring-blue-400' : ''}`}
                            >
                                <div className="flex items-center mb-1">
                                    <UserIcon className="h-8 w-8 text-gray-500 mr-3"/>
                                    <span className="font-bold text-gray-800">{emp.name}</span>
                                </div>
                                <p className="text-gray-500 text-sm">{emp.email}</p>
                            </button>
                        ))}
                        {!employees.length && (
                            <div className="text-gray-500">No employees</div>
                        )}
                    </div>

        
                    <div className="flex-1 flex flex-col bg-gray-100 rounded-xl">
                       
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">{selected ? `Chat with ${selectedName}` : 'Select a conversation'}</h3>
                        </div>

            
                        <div ref={listRef} className="flex-1 p-6 overflow-y-auto space-y-3">
                            {loading && <div className="text-sm text-gray-500">Loading…</div>}
                            {selected && messages.map((m) => (
                                <div key={m.id || m.at} className={`flex ${m.from === 'owner' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`${m.from === 'owner' ? 'bg-blue-600 text-white' : 'bg-white border'} max-w-[75%] px-3 py-2 rounded-lg text-sm shadow-sm`}>
                                        <div className="whitespace-pre-wrap break-words">{m.text}</div>
                                        <div className="text-[10px] opacity-70 mt-1">{new Date(m.at).toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                            {selected && !messages.length && !loading && (
                                <div className="text-sm text-gray-500">No messages yet.</div>
                            )}
                            {!selected && (
                                <div className="text-sm text-gray-500">Pick a conversation to start chatting.</div>
                            )}
                        </div>

                 
                        <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                            <input
                                disabled={!selected}
                                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 disabled:bg-gray-200"
                                placeholder={selected ? 'Type a message' : 'Select a conversation'}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button type="submit" disabled={!selected} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">Send</button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MessagePage;