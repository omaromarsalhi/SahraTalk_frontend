import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user.id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100 shadow-xl">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-full shadow-sm">
            <Users className="size-6 text-primary" />
          </div>
          <span className="font-bold text-lg hidden lg:block text-primary tracking-wide">
            Contacts
          </span>
        </div>

        <div className="mt-4 hidden lg:flex items-center gap-4 justify-between">
          <label className="cursor-pointer flex items-center gap-2 bg-base-200 p-2 rounded-lg hover:bg-base-300 transition-colors">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary"
            />
            <span className="text-sm font-medium">Show online only</span>
          </label>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-zinc-500 font-medium">
              {onlineUsers.length === 0 ? 0 : onlineUsers.length - 1} online
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable contacts */}
      <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent">
        {filteredUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-3 flex items-center gap-4 rounded-xl
          hover:bg-primary/5 hover:shadow-lg transition-all duration-150
          ${
            selectedUser?.id === user.id
              ? "bg-primary/20 border-r-4 border-primary shadow-lg"
              : ""
          }
        `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.image || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full border-2 border-primary/30 shadow-md"
              />
              {onlineUsers.includes(user.id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100 shadow" />
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="inline-block px-2 py-0.5 bg-primary/10 text-primary font-semibold text-sm rounded-md shadow-sm mb-1 truncate font-mono">
                @{user.username}
              </div>
              <div
                className={`text-xs flex items-center gap-1 mt-1 ${
                  onlineUsers.includes(user.id)
                    ? "text-green-600"
                    : "text-zinc-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    onlineUsers.includes(user.id)
                      ? "bg-green-500"
                      : "bg-zinc-400"
                  }`}
                />
                {onlineUsers.includes(user.id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-400 py-10 flex flex-col items-center gap-3">
            <Users className="size-12 text-zinc-300 mb-2" />
            <span className="font-semibold text-base">
              {showOnlineOnly ? "No online users" : "No contacts found"}
            </span>
          </div>
        )}
      </div>

      {/* Fixed bottom section for current user */}
      {authUser && (
        <div className="w-full p-4 border-t border-base-300 bg-base-100">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/10 border border-primary/10 shadow-inner">
            <div className="relative">
              <img
                src={authUser.image || "/avatar.png"}
                alt={authUser.name}
                className="size-12 rounded-full object-cover border-2 border-primary/30 shadow-md"
              />

              <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100 shadow" />
            </div>
            <div className="hidden lg:block text-left flex-1 min-w-0">
              <div className="font-semibold text-primary text-lg truncate font-mono">
                @{authUser.username}
              </div>
              
            </div>
            <div className="font-semibold text-primary text-2xl truncate font-mono">
              🫡
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
