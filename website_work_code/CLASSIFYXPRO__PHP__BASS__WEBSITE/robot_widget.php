<!-- ✅ Robot Widget Start -->
<div id="robotWidget" class="fixed bottom-6 right-6 z-50">
  <!-- Toggle Button -->
  <button id="robotToggle" class="bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:scale-110 hover:bg-blue-700 transition-all">
    🤖 Chat
  </button>

  <!-- Chat + Robot -->
  <div id="robotBox" class="hidden fixed bottom-24 right-6 w-80 bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
    
    <!-- 🔹 Robot Video -->
    <div class="bg-gray-100 flex justify-center p-2">
      <video autoplay loop muted playsinline class="w-24 h-24 rounded-full border-2 border-blue-400 shadow-lg">
        <source src="145864-787701151_small.mp4" type="video/mp4">
        Your browser does not support video.
      </video>
    </div>

    <!-- 🔹 Header -->
    <div class="bg-blue-600 text-white p-3 font-semibold flex justify-between items-center">
      <span>AI Assistant</span>
      <button id="robotClose" class="text-white hover:text-gray-200">&times;</button>
    </div>

    <!-- 🔹 Messages -->
    <div id="robotMessages" class="p-3 h-48 overflow-y-auto text-sm space-y-2">
      <p class="text-gray-500 text-center">👋 Hello! How can I help you today?</p>
    </div>

    <!-- 🔹 Input -->
    <div class="p-3 border-t flex gap-2">
      <input id="robotInput" type="text" placeholder="Type a message..." class="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <button id="robotSend" class="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition">Send</button>
    </div>
  </div>
</div>

<!-- ✅ Widget Script -->
<script>
  const robotToggle = document.getElementById("robotToggle");
  const robotBox = document.getElementById("robotBox");
  const robotClose = document.getElementById("robotClose");
  const robotSend = document.getElementById("robotSend");
  const robotInput = document.getElementById("robotInput");
  const robotMessages = document.getElementById("robotMessages");

  robotToggle.addEventListener("click", ()=> robotBox.classList.toggle("hidden"));
  robotClose.addEventListener("click", ()=> robotBox.classList.add("hidden"));

  robotSend.addEventListener("click", sendRobotMsg);
  robotInput.addEventListener("keypress", e=>{
    if(e.key==="Enter") sendRobotMsg();
  });

  function sendRobotMsg(){
    let msg = robotInput.value.trim();
    if(msg!==""){
      let p = document.createElement("p");
      p.className = "bg-blue-100 text-gray-800 px-3 py-2 rounded-lg text-sm ml-auto w-fit";
      p.textContent = msg;
      robotMessages.appendChild(p);
      robotMessages.scrollTop = robotMessages.scrollHeight;
      robotInput.value = "";

      // Fake reply
      setTimeout(()=>{
        let reply = document.createElement("p");
        reply.className = "bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm mr-auto w-fit";
        reply.textContent = "🤖: I'm just a demo bot!";
        robotMessages.appendChild(reply);
        robotMessages.scrollTop = robotMessages.scrollHeight;
      }, 800);
    }
  }
</script>
<!-- ✅ Robot Widget End -->
