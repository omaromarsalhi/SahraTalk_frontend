import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSelected, setImageSelected] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage, sendImage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select an image file");
      return;
    }

    setImageSelected(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageSelected(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    const textCopy = text.trim();
    const formData = new FormData();
    formData.append("file", imageSelected);

    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      setIsUploading(true);
      const image = imageSelected ? await sendImage(formData) : null;

      await sendMessage({
        text: textCopy,
        image: image,
      });

      setImageSelected(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className={`w-20 h-20 object-cover rounded-lg border border-zinc-700 transition-opacity duration-300 ${
                isUploading ? "opacity-50" : "opacity-100"
              }`}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              </div>
            )}
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
              disabled={isUploading}
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className={`w-full input input-bordered rounded-lg input-sm sm:input-md transition-all duration-300 ${
              isUploading ? "opacity-70" : "opacity-100"
            }`}
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isUploading}
          />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle transition-all duration-300 ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            } ${isUploading ? "opacity-50" : "opacity-100"}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={(!text.trim() && !imagePreview) || isUploading}
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : (
            <Send size={22} />
          )}
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
