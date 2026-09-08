document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.getElementById("menu-btn");
  const menu = document.getElementById("menu");

  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      menu.classList.toggle("hidden");
    });
  }
});

const voiceBtn = document.getElementById("voiceBtn");
    const searchInput = document.getElementById("searchInput");
    const form = document.getElementById("searchForm");
    const listenPopup = document.getElementById("listenPopup");
    const searchIcon = document.getElementById("searchIcon");

    // ✅ Search icon click submit
    searchIcon.addEventListener("click", ()=>{
      if(searchInput.value.trim() !== ""){
        form.submit();
      }
    });

    if('webkitSpeechRecognition' in window){
      const recognition = new webkitSpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;

      voiceBtn.addEventListener("click", ()=>{
        listenPopup.style.display="flex";
        recognition.start();
      });

      recognition.onresult = function(event){
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        listenPopup.style.display="none";
        form.submit(); 
      };

      recognition.onend = ()=>{ listenPopup.style.display="none"; };
    } else { voiceBtn.style.display = "none"; }



    // Add class for search focus animation
searchInput.addEventListener("focus", ()=>{
  searchInput.style.transform="scale(1.02)";
});
searchInput.addEventListener("blur", ()=>{
  searchInput.style.transform="scale(1)";
});

// ✅ Share button function (with fallback)
  function shareAd(id, title){
    const url = "view-ads.php?id=" + id;
    if (navigator.share) {
      navigator.share({
        title: title,
        text: "Check out this ad: " + title,
        url: url
      }).catch(err => console.log("Share cancelled:", err));
    } else {
      // Fallback → Copy link to clipboard
      navigator.clipboard.writeText(window.location.origin + "/" + url).then(() => {
        alert("Ad link copied to clipboard ✅");
      });
    }
  }

// Intersection Observer for the Story Section
    const storyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.2 });

    // Target all reveal elements
    document.querySelectorAll('.story-reveal').forEach(el => {
        storyObserver.observe(el);
    });

const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Staggered delay (ek ke baad ek box aayega)
                setTimeout(() => {
                    entry.target.classList.add('active');
                    // Start counter in this box
                    const counter = entry.target.querySelector('.count-me');
                    if(counter) runCounter(counter);
                }, index * 200); 
                aboutObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.about-box').forEach(box => {
        aboutObserver.observe(box);
    });

    function runCounter(el) {
        const target = +el.getAttribute('data-target');
        let current = 0;
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); 

        const update = () => {
            current += step;
            if (current < target) {
                el.innerText = Math.ceil(current);
                requestAnimationFrame(update);
            } else {
                el.innerText = target;
            }
        };
        update();
    }

// 1. Toggle Functionality (Fixed)
    document.querySelectorAll('.faq-head').forEach(header => {
        header.addEventListener('click', () => {
            const parent = header.parentElement;
            const body = header.nextElementSibling;
            
            // Close others
            document.querySelectorAll('.faq-tag').forEach(item => {
                if(item !== parent) {
                    item.classList.remove('open');
                    item.querySelector('.faq-body').style.height = "0";
                }
            });

            // Toggle current
            parent.classList.toggle('open');
            if(parent.classList.contains('open')) {
                body.style.height = body.scrollHeight + "px";
            } else {
                body.style.height = "0";
            }
        });
    });

    // 2. Scroll Animation (Smooth Reveal)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 150);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.faq-tag, .faq-reveal').forEach(el => observer.observe(el));

const chatPopupBox = document.getElementById("chatPopupBox");
  const chatMessages = document.getElementById("chatMessages");
  const chatAdTitle = document.getElementById("chatAdTitle");
  const chatInput = document.getElementById("chatInput");

  function openChat(adId, title) {
    chatAdTitle.innerHTML = '<i class="fas fa-comments text-xl"></i> ' + title;
    chatPopupBox.classList.remove("hidden");
    chatPopupBox.classList.add("animate-slideUp");
    document.body.classList.add("blurred");
  }

  function toggleChatBox() {
    chatPopupBox.classList.add("hidden");
    document.body.classList.remove("blurred");
  }

  function sendMessage() {
    let msg = chatInput.value.trim();
    if(msg !== "") {
      // User message
      let p = document.createElement("p");
      p.className = "text-sm bg-green-100 text-gray-800 px-3 py-2 rounded-lg mb-2 ml-auto max-w-[75%]";
      p.textContent = msg;
      chatMessages.appendChild(p);

      chatInput.value = "";
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Fake reply (demo)
      setTimeout(() => {
        let reply = document.createElement("p");
        reply.className = "text-sm bg-gray-200 text-gray-800 px-3 py-2 rounded-lg mb-2 mr-auto max-w-[75%]";
        reply.textContent = "Thanks for your message!";
        chatMessages.appendChild(reply);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 800);
    }
  }
