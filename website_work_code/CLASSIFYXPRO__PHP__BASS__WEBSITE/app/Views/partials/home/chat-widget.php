<!-- ✅ Chat Popup Box -->
<div id="chatPopupBox" class="hidden fixed bottom-80 right-6 bg-white rounded-2xl shadow-2xl w-96 max-w-[90%] border border-gray-200 z-50 overflow-hidden animate-slideUp">
  <!-- Header -->
  <div class="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 font-bold flex justify-between items-center shadow-md">
    <span id="chatAdTitle" class="flex items-center gap-2">
      <i class="fas fa-comments text-xl"></i> Live Chat
    </span>
    <button onclick="toggleChatBox()" aria-label="Close chat" class="text-white hover:text-gray-200 transition transform hover:rotate-90">✖</button>
  </div>

  <!-- Messages -->
  <div class="p-4 h-72 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100" id="chatMessages">
    <p class="text-gray-500 text-sm text-center">Start conversation...</p>
  </div>

  <!-- Input -->
  <div class="flex border-t bg-white shadow-inner">
    <input type="text" id="chatInput" placeholder="Type a message..."
      class="flex-grow px-3 py-2 text-sm outline-none bg-transparent placeholder-gray-400">
    <button onclick="sendMessage()" aria-label="Send message"
      class="bg-green-500 hover:bg-green-600 text-white px-5 flex items-center justify-center transition">
      <i class="fas fa-paper-plane"></i>
    </button>
  </div>
</div>

<!--fiell with about section-->






