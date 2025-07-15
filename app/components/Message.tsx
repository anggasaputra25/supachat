import Markdown from "react-markdown";
import { TMessage } from "../types/message";

const ComponentMessages = ({ content }: {content: TMessage[]}) => {
  return (
    <>
      {content.map((msg, idx) => (
        <div
          key={idx}
          className={`my-2 py-3 rounded-md rounded-t-none max-w-full w-fit text-white px-3 prose ${msg.isSender ? 'bg-violet-800 self-end ml-auto rounded-l-md' : 'bg-neutral-800 self-start mr-auto rounded-r-md'}`}
        >
          <Markdown>{msg.content}</Markdown>
        </div>
      ))}
    </>
  );
};

export default ComponentMessages;