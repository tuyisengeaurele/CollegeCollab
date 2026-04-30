import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Search, MessageSquare, Plus } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/auth.store';

const mockContacts = [
  { id: '1', firstName: 'Dr', lastName: 'Smith', role: 'LECTURER', lastMessage: 'Please check the lab submission', time: '2m', unread: 2 },
  { id: '2', firstName: 'Alice', lastName: 'Ntwali', role: 'STUDENT', lastMessage: 'Thanks for your help!', time: '1h', unread: 0 },
  { id: '3', firstName: 'Prof', lastName: 'Johnson', role: 'LECTURER', lastMessage: 'Assignment feedback attached', time: '3h', unread: 1 },
  { id: '4', firstName: 'Bob', lastName: 'Hakizimana', role: 'STUDENT', lastMessage: 'Are you free for a study session?', time: 'Yesterday', unread: 0 },
];

const mockMessages = [
  { id: '1', senderId: '1', content: 'Hi! I have a question about the binary trees assignment.', time: '10:30 AM', mine: false },
  { id: '2', senderId: 'me', content: 'Sure, what would you like to know?', time: '10:31 AM', mine: true },
  { id: '3', senderId: '1', content: 'I am having trouble with the traversal algorithm. Specifically the in-order traversal.', time: '10:32 AM', mine: false },
  { id: '4', senderId: 'me', content: 'In-order traversal visits: left subtree, root, then right subtree. So for a BST, it gives sorted output.', time: '10:33 AM', mine: true },
  { id: '5', senderId: '1', content: 'Oh that makes sense! Thanks a lot.', time: '10:34 AM', mine: false },
  { id: '6', senderId: '1', content: 'Please check the lab submission', time: '10:35 AM', mine: false },
];

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [selectedContact, setSelectedContact] = useState(mockContacts[0]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const [search, setSearch] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), senderId: 'me', content: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), mine: true }
    ]);
    setMessage('');
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Contacts List */}
        <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-[#E2E8F7] flex flex-col overflow-hidden shadow-[0_2px_16px_0_rgba(30,80,162,0.08)]">
          <div className="p-4 border-b border-[#E2E8F7]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1A2744]">Messages</h2>
              <Button variant="ghost" size="xs" leftIcon={<Plus className="w-3.5 h-3.5" />}>New</Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896B3]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-9 pr-3 py-2 bg-[#F0F4FF] rounded-xl text-sm text-[#1A2744] placeholder:text-[#8896B3] focus:outline-none border border-transparent focus:border-[#1E50A2]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hidden">
            {mockContacts
              .filter((c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()))
              .map((contact) => (
                <motion.button
                  key={contact.id}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedContact(contact)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8FAFF] transition-colors',
                    selectedContact.id === contact.id && 'bg-[#F0F4FF] border-l-2 border-[#1E50A2]'
                  )}
                >
                  <div className="relative">
                    <Avatar firstName={contact.firstName} lastName={contact.lastName} size="sm" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-[#1A2744] truncate">{contact.firstName} {contact.lastName}</p>
                      <span className="text-[10px] text-[#8896B3] flex-shrink-0 ml-1">{contact.time}</span>
                    </div>
                    <p className="text-xs text-[#8896B3] truncate mt-0.5">{contact.lastMessage}</p>
                  </div>
                  {contact.unread > 0 && (
                    <span className="w-5 h-5 bg-[#1E50A2] text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      {contact.unread}
                    </span>
                  )}
                </motion.button>
              ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl border border-[#E2E8F7] flex flex-col overflow-hidden shadow-[0_2px_16px_0_rgba(30,80,162,0.08)]">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E2E8F7]">
            <div className="relative">
              <Avatar firstName={selectedContact.firstName} lastName={selectedContact.lastName} size="md" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="font-semibold text-[#1A2744]">{selectedContact.firstName} {selectedContact.lastName}</p>
              <p className="text-xs text-emerald-500 font-medium">Online · {selectedContact.role.toLowerCase()}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hidden bg-[#F8FAFF]">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3', msg.mine && 'flex-row-reverse')}
              >
                {!msg.mine && (
                  <Avatar firstName={selectedContact.firstName} lastName={selectedContact.lastName} size="xs" />
                )}
                {msg.mine && user && (
                  <Avatar firstName={user.firstName} lastName={user.lastName} size="xs" />
                )}
                <div className={cn(
                  'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm',
                  msg.mine
                    ? 'bg-[#1E50A2] text-white rounded-tr-sm'
                    : 'bg-white text-[#1A2744] border border-[#E2E8F7] rounded-tl-sm shadow-sm'
                )}>
                  <p>{msg.content}</p>
                  <p className={cn('text-[10px] mt-1', msg.mine ? 'text-white/70 text-right' : 'text-[#8896B3]')}>
                    {msg.time}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-[#E2E8F7] bg-white">
            <div className="flex items-center gap-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-[#F0F4FF] rounded-xl text-sm text-[#1A2744] placeholder:text-[#8896B3] focus:outline-none border border-transparent focus:border-[#1E50A2] transition-all"
              />
              <Button
                onClick={sendMessage}
                disabled={!message.trim()}
                size="md"
                leftIcon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
