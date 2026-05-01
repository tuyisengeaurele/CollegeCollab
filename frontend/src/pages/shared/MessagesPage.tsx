import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Search, Plus, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/auth.store';
import { messagesService } from '@/services/messages.service';
import type { User } from '@/types';

interface Contact {
  id: string;
  user: User;
  lastMessage: string;
  lastTime: Date;
  unread: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
  sender: User;
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showUserPicker, setShowUserPicker] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['messages', 'contacts'],
    queryFn: () => messagesService.getContacts(),
    refetchInterval: 10000,
  });

  const { data: usersData } = useQuery({
    queryKey: ['messages', 'all-users'],
    queryFn: () => messagesService.getUsers(),
    enabled: showUserPicker,
  });

  const { data: threadData, isLoading: threadLoading } = useQuery({
    queryKey: ['messages', 'thread', selectedUserId],
    queryFn: () => messagesService.getThread(selectedUserId!),
    enabled: !!selectedUserId,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: ({ receiverId, content }: { receiverId: string; content: string }) =>
      messagesService.send(receiverId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['messages', 'thread', selectedUserId] });
      void queryClient.invalidateQueries({ queryKey: ['messages', 'contacts'] });
      setMessage('');
    },
  });

  const contacts: Contact[] = contactsData?.data?.data || [];
  const allUsers: User[] = usersData?.data?.data || [];
  const thread: Message[] = threadData?.data?.data || [];

  const selectedContact = contacts.find((c) => c.id === selectedUserId);
  const selectedUser = selectedContact?.user || allUsers.find((u) => u.id === selectedUserId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const handleSend = useCallback(() => {
    if (!message.trim() || !selectedUserId) return;
    sendMutation.mutate({ receiverId: selectedUserId, content: message.trim() });
  }, [message, selectedUserId, sendMutation]);

  const filteredContacts = contacts.filter((c) =>
    `${c.user.firstName} ${c.user.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Contacts List */}
        <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-[#E2E8F7] flex flex-col overflow-hidden shadow-[0_2px_16px_0_rgba(30,80,162,0.08)]">
          <div className="p-4 border-b border-[#E2E8F7]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1A2744]">Messages</h2>
              <Button
                variant="ghost"
                size="xs"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setShowUserPicker(true)}
              >
                New
              </Button>
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
            {contactsLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-[#E2E8F7] animate-pulse" />
                  <div className="flex-1">
                    <div className="h-3 bg-[#E2E8F7] rounded animate-pulse w-3/4 mb-2" />
                    <div className="h-2 bg-[#E2E8F7] rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            ) : filteredContacts.length === 0 && !showUserPicker ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-[#8896B3]">
                <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs mt-1">Click "New" to start messaging</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <motion.button
                  key={contact.id}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => { setSelectedUserId(contact.id); setShowUserPicker(false); }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8FAFF] transition-colors',
                    selectedUserId === contact.id && 'bg-[#F0F4FF] border-l-2 border-[#1E50A2]'
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar firstName={contact.user.firstName} lastName={contact.user.lastName} size="sm" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-[#1A2744] truncate">
                        {contact.user.firstName} {contact.user.lastName}
                      </p>
                    </div>
                    <p className="text-xs text-[#8896B3] truncate mt-0.5">{contact.lastMessage}</p>
                  </div>
                  {contact.unread > 0 && (
                    <span className="w-5 h-5 bg-[#1E50A2] text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      {contact.unread}
                    </span>
                  )}
                </motion.button>
              ))
            )}

            {/* New conversation user picker */}
            {showUserPicker && (
              <div className="border-t border-[#E2E8F7]">
                <div className="px-4 py-2 text-xs text-[#8896B3] font-medium">Start new conversation</div>
                {allUsers
                  .filter((u) => !contacts.find((c) => c.id === u.id))
                  .map((u) => (
                    <motion.button
                      key={u.id}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => { setSelectedUserId(u.id); setShowUserPicker(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F8FAFF] transition-colors"
                    >
                      <Avatar firstName={u.firstName} lastName={u.lastName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A2744] truncate">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-[#8896B3] capitalize">{u.role.toLowerCase()}</p>
                      </div>
                    </motion.button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-2xl border border-[#E2E8F7] flex flex-col overflow-hidden shadow-[0_2px_16px_0_rgba(30,80,162,0.08)]">
          {!selectedUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[#8896B3]">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-[#4A5878]">Select a conversation</p>
              <p className="text-sm mt-1">Choose from the left or start a new one</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E2E8F7]">
                {selectedUser && (
                  <>
                    <div className="relative">
                      <Avatar firstName={selectedUser.firstName} lastName={selectedUser.lastName} size="md" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A2744]">{selectedUser.firstName} {selectedUser.lastName}</p>
                      <p className="text-xs text-emerald-500 font-medium capitalize">
                        {selectedUser.role.toLowerCase()}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hidden bg-[#F8FAFF]">
                {threadLoading ? (
                  <div className="flex items-center justify-center h-full text-[#8896B3] text-sm">
                    Loading messages…
                  </div>
                ) : thread.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#8896B3]">
                    <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  thread.map((msg) => {
                    const mine = msg.senderId === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn('flex gap-3', mine && 'flex-row-reverse')}
                      >
                        {!mine && selectedUser && (
                          <Avatar firstName={selectedUser.firstName} lastName={selectedUser.lastName} size="xs" />
                        )}
                        {mine && user && (
                          <Avatar firstName={user.firstName} lastName={user.lastName} size="xs" />
                        )}
                        <div className={cn(
                          'max-w-[70%] px-4 py-2.5 rounded-2xl text-sm',
                          mine
                            ? 'bg-[#1E50A2] text-white rounded-tr-sm'
                            : 'bg-white text-[#1A2744] border border-[#E2E8F7] rounded-tl-sm shadow-sm'
                        )}>
                          <p>{msg.content}</p>
                          <p className={cn('text-[10px] mt-1', mine ? 'text-white/70 text-right' : 'text-[#8896B3]')}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-[#E2E8F7] bg-white">
                <div className="flex items-center gap-3">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-[#F0F4FF] rounded-xl text-sm text-[#1A2744] placeholder:text-[#8896B3] focus:outline-none border border-transparent focus:border-[#1E50A2] transition-all"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || sendMutation.isPending}
                    size="md"
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
