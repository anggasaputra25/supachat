'use client';

import { useParams } from 'next/navigation';
import NavbarChat from '@/app/components/NavbarChat';
import NavbarChatSkeleton from '@/app/components/NavbarChatSkeleton';
import ComponentMessages from '@/app/components/Message';
import { HiPaperAirplane } from 'react-icons/hi';
import { FaPlus } from 'react-icons/fa';
import { useChat } from '@/app/hooks/useChat';

const Chat = () => {
  const { username } = useParams();
  const {
    recipient,
    loading,
    messages,
    input,
    textareaRef,
    handleInput,
    handleSend,
    sending
  } = useChat(username as string);

  return (
    <div className="h-screen flex flex-col">
      {loading ? <NavbarChatSkeleton /> : <NavbarChat recipient={recipient} />}
      <div className="h-full px-3 md:px-10 py-2 flex flex-col overflow-y-scroll
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-gray-300
      ">
        <ComponentMessages content={messages} />
      </div>
      <div className="w-full px-3 md:px-10 space-y-5 mb-5">
        <div className="rounded-sm bg-neutral-900 px-4 py-4 flex flex-col gap-3">
          <textarea
            required
            maxLength={200}
            ref={textareaRef}
            className="w-full py-2 border-0 focus:outline-none focus:ring-0 resize-none overflow-hidden font-medium bg-transparent text-white placeholder-gray-400"
            placeholder="Type a message"
            value={input}
            onChange={handleInput} // ← Gunakan ini yang sudah ada dari hook
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) {
                  // Shift + Enter: allow new line
                  return;
                } else {
                  // Just Enter: send message
                  e.preventDefault();
                  handleSend();
                }
              }
            }}
            rows={1}
            style={{
              minHeight: '40px',
              maxHeight: '200px',
              lineHeight: '1.5'
            }}
          />
          <div className="flex justify-between items-center">
            <button
              className="p-3 cursor-pointer bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                alert('This feature is coming soon!');
              }}
            >
              <FaPlus className="text-md text-white" />
            </button>
            <button
              type="button"
              className="p-2 cursor-pointer bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"
              title="Send"
              onClick={handleSend}
              disabled={sending || !input.trim()}
            >
              {sending ? (
                // Loading spinner saat sending
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <HiPaperAirplane className="text-2xl text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;