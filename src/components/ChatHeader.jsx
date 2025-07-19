import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.image || "/avatar.png"} alt={selectedUser.username} />
            </div>
             {onlineUsers.includes(selectedUser.id) && (
              <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100 shadow" />
            )}
          </div>

          {/* User info */}
          <div className="flex items-center text-left min-w-0 flex-1">
            <div className="inline-block px-2 py-0.5 bg-primary/10 text-primary font-semibold text-md rounded-md shadow-sm truncate font-mono">
              @{selectedUser.username}
            </div>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;


 



