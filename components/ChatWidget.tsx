import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, AlertTriangle, User, Bot, ShieldCheck, Minimize2, Maximize2 } from 'lucide-react';
import { getChatSession, sendChatMessage, markChatRead } from '../services/mockBackend';
import { ChatSession, ChatMessage } from '../types';

interface ChatWidgetProps {
    userId: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [session, setSession] = useState<ChatSession | null>(null);
    const [loading, setLoading] = useState(false);
    const [isIssue, setIsIssue] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && userId) {
            const chatSession = getChatSession(userId);
            setSession({ ...chatSession });
            markChatRead(userId);
            scrollToBottom();
        }
    }, [isOpen, userId]);

    useEffect(() => {
        scrollToBottom();
    }, [session?.messages]);

    // Poll for updates (simulate real-time)
    useEffect(() => {
        if (!isOpen) return;
        
        const interval = setInterval(() => {
            const updatedSession = getChatSession(userId);
            if (updatedSession.messages.length !== session?.messages.length) {
                 setSession({ ...updatedSession });
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [isOpen, userId, session]);

    const handleSend = async () => {
        if (!message.trim()) return;
        
        setLoading(true);
        const currentMsg = message;
        setMessage('');
        
        // Optimistic update
        const tempMsg: ChatMessage = {
            id: 'temp',
            senderId: userId,
            message: currentMsg,
            timestamp: new Date().toISOString(),
            type: 'USER',
            isIssue
        };
        
        if (session) {
            setSession({
                ...session,
                messages: [...session.messages, tempMsg]
            });
        }

        try {
            await sendChatMessage(userId, currentMsg, isIssue);
            const updatedSession = getChatSession(userId);
            setSession({ ...updatedSession });
            setIsIssue(false); // Reset issue flag after sending
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 z-50 group"
            >
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full animate-pulse hidden group-hover:block"></div>
                <MessageSquare size={24} />
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'w-72 h-14' : 'w-80 md:w-96 h-[500px]'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1e293b] bg-[#1e293b]/50 rounded-t-2xl cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-bold text-white">Support Assistant</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="hover:text-white">
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="hover:text-white">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b1120]/50">
                        {session?.messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.type === 'USER' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-3 ${
                                    msg.type === 'USER' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : msg.type === 'ADMIN'
                                            ? 'bg-purple-600/20 border border-purple-500/50 text-white rounded-tl-none'
                                            : 'bg-[#1e293b] text-gray-200 rounded-tl-none'
                                }`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {msg.type === 'BOT' && <Bot size={12} className="text-cyan-400" />}
                                        {msg.type === 'ADMIN' && <ShieldCheck size={12} className="text-purple-400" />}
                                        <span className="text-[10px] opacity-50 uppercase font-bold">
                                            {msg.type === 'USER' ? 'You' : msg.type}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed">{msg.message}</p>
                                    {msg.isIssue && (
                                        <div className="mt-2 flex items-center gap-1 text-[10px] text-red-300 bg-red-500/20 px-2 py-1 rounded">
                                            <AlertTriangle size={10} /> Reported Issue
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                             <div className="flex justify-start">
                                <div className="bg-[#1e293b] rounded-2xl rounded-tl-none p-3 flex gap-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                                </div>
                             </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-[#1e293b] bg-[#1e293b]/30">
                        <div className="flex items-center gap-2 mb-2">
                             <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer hover:text-white transition">
                                <input 
                                    type="checkbox" 
                                    checked={isIssue} 
                                    onChange={(e) => setIsIssue(e.target.checked)}
                                    className="rounded border-gray-600 bg-transparent text-red-500 focus:ring-red-500"
                                />
                                <span className={isIssue ? "text-red-400 font-bold" : ""}>Report as Issue/Complaint</span>
                             </label>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type your message..."
                                className="flex-1 bg-[#0b1120] border border-[#334155] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!message.trim() || loading}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatWidget;
