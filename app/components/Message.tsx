import Markdown from "react-markdown";
import { TMessage } from "../types/message";
import { FaRegTrashAlt } from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

const ComponentMessages = ({ content }: { content: TMessage[] }) => {
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete this message?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      confirmButtonText: "Yes, delete it",
      background: "#171717",
      color: "#fff",
    });

    if (result.isConfirmed) {
      const { error } = await supabase
        .from("messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Failed to delete message:", error.message);
        Swal.fire("Error", "Failed to delete message", "error");
      } else {
        console.log("Message deleted");
        Swal.fire({
          title: "Deleted!",
          text: "Your message has been deleted.",
          icon: "success",
          background: "#171717",
          color: "#fff",
          confirmButtonColor: "#4f46e5", // Tailwind violet-700
        });
      }
    }
    };

  return (
    <>
      {content.map((msg, idx) => (
        <div
          key={idx}
          className={`relative group w-fit ${
            msg.isSender
              ? "self-end ml-auto rounded-l-md"
              : "self-start mr-auto rounded-r-md"
          }`}
        >
          <div
            className={`mt-2 py-3 rounded-md rounded-t-none max-w-full w-fit text-white px-3 z-20 prose ${
              msg.isSender
                ? "bg-violet-800 self-end ml-auto rounded-l-md"
                : "bg-neutral-800 self-start mr-auto rounded-r-md"
            } ${msg.deleted_at ? "italic opacity-50" : ""}`}
          >
            <Markdown>
              {msg.deleted_at ? "Message has been deleted" : msg.content}
            </Markdown>
          </div>

          <div
            className={`absolute end-0 transition-all duration-300 bottom-0 z-0 ps-2 cursor-pointer ${
              msg.isSender && !msg.deleted_at
                ? "group-hover:-right-5 group-hover:rounded-none group-hover:opacity-100 right-0 rounded-lg opacity-0"
                : "hidden"
            }`}
            onClick={() => handleDelete(msg.id)}
          >
            <FaRegTrashAlt />
          </div>
        </div>
      ))}
    </>
  );
};

export default ComponentMessages;