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
            ref={textareaRef}
            className="w-full py-2 border-0 focus:outline-none focus:ring-0 resize-none overflow-hidden font-medium"
            placeholder="Type a message"
            value={input}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
          />
          <div className="flex justify-between items-center">
            <button
              className="p-3 cursor-pointer bg-neutral-800 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                alert('This feature is coming soon!');
              }}
            >
              <FaPlus className="text-md" />
            </button>
            <button
              type="button"
              className="p-2 cursor-pointer bg-neutral-800 rounded-full"
              title="Send"
              onClick={handleSend}
            >
              <HiPaperAirplane className="text-2xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;