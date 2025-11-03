import { useState } from "react";

export const ChatWidget = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatName, setChatName] = useState("");
  const [chatEmail, setChatEmail] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatSent, setChatSent] = useState(false);
  const handleChatSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would send to your backend/email service
    // For now, we'll create a mailto link
    const subject = encodeURIComponent(`Wild Things Inquiry from ${chatName}`);
    const body = encodeURIComponent(
      `Name: ${chatName}\nEmail: ${chatEmail}\n\nMessage:\n${chatMessage}`
    );
    window.location.href = `mailto:james.s@wildthings.com.au?subject=${subject}&body=${body}`;
    setChatSent(true);
    setTimeout(() => {
      setChatOpen(false);
      setChatSent(false);
      setChatMessage("");
      setChatName("");
      setChatEmail("");
    }, 2000);
  };
  return (
    <>
      {/* Chat Button */}
      {!chatOpen && (
        <button
          id="chat-widget"
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-[60px] h-[60px] rounded-full bg-[#ffcf00] border-[3px] border-[#0e181f] flex items-center justify-center cursor-pointer text-[28px] shadow-[0_4px_12px_rgba(0,0,0,0.3)] z-[1000] transition-transform duration-200 hover:scale-110"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] max-w-[calc(100vw-48px)] bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.3)] z-[1000] overflow-hidden border-[3px] border-[#ffcf00]">
          {/* Chat Header */}
          <div className="bg-[#0e181f] p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ffcf00] flex items-center justify-center text-[20px]">
                👋
              </div>
              <div>
                <div className="text-white font-bold">
                  James
                </div>
                <div className="text-[#86dbdf] text-xs">
                  Wild Things Team
                </div>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white bg-transparent border-none cursor-pointer text-2xl p-0 w-[30px] h-[30px]"
            >
              ✕
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {!chatSent ? (
              <>
                <div className="bg-[#86dbdf]/[0.2] p-3 rounded-lg mb-4">
                  <p className="m-0 text-sm text-[#0e181f]">
                    Hi! I'm James. How can I help you today? Feel free to ask
                    about cabin investments or holiday stays!
                  </p>
                </div>

                <form
                  onSubmit={handleChatSubmit}
                  className="flex flex-col gap-3"
                >
                  <input
                    type="text"
                    placeholder="Your name"
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    required
                    className="p-2.5 rounded-md border-2 border-[#86dbdf] text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={chatEmail}
                    onChange={(e) => setChatEmail(e.target.value)}
                    required
                    className="p-2.5 rounded-md border-2 border-[#86dbdf] text-sm"
                  />
                  <textarea
                    placeholder="Your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    required
                    rows={4}
                    className="p-2.5 rounded-md border-2 border-[#86dbdf] text-sm resize-none font-[inherit]"
                  />
                  <button
                    type="submit"
                    className="bg-[#ffcf00] text-[#0e181f] p-3 rounded-md border-none font-bold cursor-pointer text-sm"
                  >
                    Send Message
                  </button>
                </form>
              </>
            ) : (
              <div className="bg-[#ffcf00]/[0.2] p-5 rounded-lg text-center">
                <div className="text-5xl mb-3">✅</div>
                <p className="m-0 font-bold text-[#0e181f]">
                  Message sent! I'll get back to you soon.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
