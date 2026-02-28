(function() {
    function initMzWidget() {
        // جلوگیری از اجرای چندباره
        if (document.getElementById('mz-chat-main-wrapper')) return;

        // پیدا کردن لایسنس از تگ اسکریپت
        const scripts = document.getElementsByTagName('script');
        let lk = null;
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].getAttribute('data-license')) {
                lk = scripts[i].getAttribute('data-license');
                break;
            }
        }

        if (!lk) {
            console.error("MozheBazar: License Key Missing! Please add data-license to your script tag.");
            return;
        }

        const originDomain = window.location.hostname.replace(/^www\./, '');
        const MZ_SERVER_URL = "https://script.google.com/macros/s/AKfycbxvfpKr_kQqjsiNhdDiuSehvn-mJBtrGuE37n6pzVciNzNX9Z4kzs3Kgw-DiW6mXjG1/exec";
        const API_BASE = `${MZ_SERVER_URL}?license=${lk}&originDomain=${originDomain}`;

        // تزریق استایل‌های اصلاح شده با اولویت بالا
        const st = document.createElement('style');
        st.innerHTML = `
        #mz-chat-main-wrapper { font-family: Tahoma, Arial, sans-serif; direction: rtl; }
        .mz-chat-bubble {
            position: fixed !important; bottom: 30px !important; right: 30px !important;
            width: 65px !important; height: 65px !important; background: #185ABC !important;
            border-radius: 50% !important; display: flex !important; align-items: center !important;
            justify-content: center !important; cursor: pointer !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important; z-index: 2147483647 !important;
            transition: transform 0.3s !important; visibility: visible !important; opacity: 1 !important;
        }
        .mz-chat-bubble:hover { transform: scale(1.1); }
        .mz-chat-badge {
            position: absolute; top: -5px; right: -5px; background: #f44336; color: #fff;
            border-radius: 50%; width: 24px; height: 24px; font-size: 12px; font-weight: bold;
            display: none; align-items: center; justify-content: center; border: 2px solid #fff;
        }
        .mz-chat-window {
            position: fixed !important; bottom: 110px !important; right: 30px !important;
            width: 360px !important; max-width: 85vw !important; height: 550px !important;
            max-height: 70vh !important; background: #fff !important; border-radius: 20px !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important; z-index: 2147483647 !important;
            display: flex; flex-direction: column; overflow: hidden;
            transform: scale(0.8); opacity: 0; visibility: hidden;
            transform-origin: bottom right; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .mz-chat-window.active { transform: scale(1); opacity: 1; visibility: visible; }
        .mz-chat-header { background: #185ABC; color: #fff; padding: 18px; font-weight: bold; text-align: center; font-size: 16px; }
        .mz-chat-body { flex-grow: 1; padding: 15px; overflow-y: auto; background: #f9f9f9; display: flex; flex-direction: column; }
        .mz-chat-msg {
            padding: 10px 14px; border-radius: 15px; margin-bottom: 12px;
            max-width: 80%; line-height: 1.6; font-size: 14px; word-wrap: break-word; position: relative;
        }
        .mz-msg-user { background: #185ABC; color: #fff; align-self: flex-start; border-bottom-right-radius: 2px; margin-right: auto; text-align: right; }
        .mz-msg-admin { background: #fff; color: #333; align-self: flex-end; border-bottom-left-radius: 2px; margin-left: auto; box-shadow: 0 2px 5px rgba(0,0,0,0.05); text-align: right; }
        .mz-chat-form { display: flex; padding: 12px; background: #fff; border-top: 1px solid #eee; gap: 8px; align-items: center; }
        .mz-chat-input-wrapper { flex: 1; display: flex; align-items: center; background: #f0f2f5; border-radius: 25px; padding: 5px 15px; }
        .mz-chat-input { border: none; background: transparent; flex: 1; padding: 8px; outline: none; font-size: 14px; direction: rtl; }
        .mz-chat-send-btn { background: #185ABC; color: #fff; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .mz-chat-send-btn:hover { background: #144a9c; }
        .mz-auth-screen { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 30px; text-align: center; }
        .mz-auth-input { border: 2px solid #eee; border-radius: 12px; padding: 12px; margin-bottom: 15px; outline: none; text-align: center; font-size: 18px; }
        .mz-auth-btn { background: #185ABC; color: #fff; border: none; padding: 14px; border-radius: 12px; font-weight: bold; cursor: pointer; }
        .mz-typing-indicator { font-size: 12px; color: #888; margin-bottom: 10px; display: none; }
        #mz-load-more-btn { background: #eee; border: none; padding: 5px 15px; border-radius: 15px; font-size: 12px; cursor: pointer; margin: 0 auto 10px; display: none; }
        .mz-audio-preview { position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); background: #fff; padding: 10px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); display: none; gap: 10px; z-index: 100; border: 1px solid #eee; }
        .mz-btn-cancel-audio { background: #ff5252; color: #fff; border: none; padding: 5px 12px; border-radius: 8px; cursor: pointer; }
        .mz-btn-send-audio { background: #4caf50; color: #fff; border: none; padding: 5px 12px; border-radius: 8px; cursor: pointer; }
        .recording { color: #ff5252 !important; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        `;
        document.head.appendChild(st);

        // ساخت بدنه ویجت
        const wrapper = document.createElement('div');
        wrapper.id = 'mz-chat-main-wrapper';
        wrapper.innerHTML = `
            <div class="mz-chat-bubble" id="mz-chat-toggle">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                <div class="mz-chat-badge" id="mz-chat-badge">0</div>
            </div>
            <div class="mz-chat-window" id="mz-chat-main">
                <div class="mz-chat-header">پشتیبانی آنلاین</div>
                <div id="mz-auth-container" class="mz-auth-screen">
                    <p style="margin-bottom:15px; color:#555;">برای شروع، شماره موبایل خود را وارد کنید</p>
                    <input type="tel" id="mz-phone-input" class="mz-auth-input" placeholder="09123456789" maxlength="11">
                    <button id="mz-phone-submit" class="mz-auth-btn">ورود به گفتگو</button>
                </div>
                <div id="mz-chat-container" style="display:none; flex-direction:column; height:100%;">
                    <div class="mz-chat-body" id="mz-chat-history">
                        <button id="mz-load-more-btn">مشاهده پیام‌های قبلی</button>
                        <div class="mz-chat-msg mz-msg-admin">سلام، چطور می‌توانم کمکتان کنم؟</div>
                        <div id="mz-typing-indicator" class="mz-typing-indicator">در حال نوشتن...</div>
                    </div>
                    <div class="mz-audio-preview" id="mz-audio-preview">
                        <button class="mz-btn-cancel-audio" id="mz-cancel-audio">لغو</button>
                        <button class="mz-btn-send-audio" id="mz-send-audio">ارسال ویس</button>
                    </div>
                    <form class="mz-chat-form" id="mz-chat-form">
                        <input type="file" id="mz-file-input" accept="image/*" style="display:none">
                        <button type="button" id="mz-attach-btn" style="background:none; border:none; cursor:pointer; color:#777;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                        </button>
                        <div class="mz-chat-input-wrapper">
                            <input type="text" id="mz-chat-input" class="mz-chat-input" placeholder="پیام شما..." autocomplete="off">
                            <button type="button" id="mz-mic-btn" style="background:none; border:none; cursor:pointer; color:#777;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                            </button>
                        </div>
                        <button type="submit" class="mz-chat-send-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:rotate(180deg)"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(wrapper);

        // متغیرها و المان‌ها
        const toggle = document.getElementById('mz-chat-toggle'),
              win = document.getElementById('mz-chat-main'),
              history = document.getElementById('mz-chat-history'),
              form = document.getElementById('mz-chat-form'),
              input = document.getElementById('mz-chat-input'),
              authCont = document.getElementById('mz-auth-container'),
              chatCont = document.getElementById('mz-chat-container'),
              phoneInput = document.getElementById('mz-phone-input'),
              phoneSubmit = document.getElementById('mz-phone-submit'),
              badge = document.getElementById('mz-chat-badge'),
              typingInd = document.getElementById('mz-typing-indicator');

        let mobile = localStorage.getItem("mz_chat_mobile_" + lk),
            lastTime = 0,
            isWaiting = false, // همان متغیر w برای جلوگیری از تداخل فچ
            unreadCount = 0,
            isTyping = false,
            typingTimer,
            mediaRecorder,
            audioChunks = [],
            pendingAudioBase64 = null;

        // تابع نمایش بخش مربوطه (ورود یا چت)
        function checkAuth() {
            if (mobile) {
                authCont.style.display = "none";
                chatCont.style.display = "flex";
                startPolling();
            } else {
                authCont.style.display = "flex";
                chatCont.style.display = "none";
            }
        }

        // هندل کردن باز و بسته شدن
        toggle.addEventListener('click', () => {
            win.classList.toggle('active');
            if (win.classList.contains('active')) {
                unreadCount = 0;
                badge.style.display = "none";
                checkAuth();
                setTimeout(() => history.scrollTop = history.scrollHeight, 200);
            }
        });

        // ثبت شماره موبایل
        phoneSubmit.addEventListener('click', () => {
            const val = phoneInput.value.trim();
            if (/^09\d{9}$/.test(val)) {
                mobile = val;
                localStorage.setItem("mz_chat_mobile_" + lk, mobile);
                checkAuth();
            } else {
                alert("لطفاً شماره موبایل معتبر وارد کنید");
            }
        });

        // ارسال پیام متنی
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const txt = input.value.trim();
            if (!txt) return;

            addMessage(txt, "user", null);
            input.value = "";
            
            fetch(`${MZ_SERVER_URL}?userId=${mobile}&sender=user&license=${lk}&originDomain=${originDomain}`, {
                method: "POST",
                body: txt,
                mode: "no-cors"
            });
        });

        // افزودن پیام به باکس چت
        function addMessage(msg, sender, timestamp) {
            // حذف پیام لوکال اگر نسخه سروری آمد
            if (timestamp !== null) {
                const locals = history.querySelectorAll('.mz-local-msg');
                locals.forEach(el => {
                    if (el.dataset.content === msg) el.remove();
                });
            }

            const div = document.createElement('div');
            div.className = `mz-chat-msg ${sender === 'user' ? 'mz-msg-user' : 'mz-msg-admin'}`;
            if (timestamp === null) {
                div.classList.add('mz-local-msg');
                div.dataset.content = msg;
            }

            if (msg.startsWith("[IMG]")) {
                div.innerHTML = `<img src="${msg.replace("[IMG]", "")}" style="max-width:100%; border-radius:10px;">`;
            } else if (msg.startsWith("[AUDIO]")) {
                div.innerHTML = `<audio controls src="${msg.replace("[AUDIO]", "")}" style="width:100%; height:30px;"></audio>`;
            } else {
                div.innerText = msg;
            }

            history.insertBefore(div, typingInd);
            history.scrollTop = history.scrollHeight;
        }

        // پولینگ (دریافت پیام‌های جدید)
        function fetchUpdates() {
            if (!mobile || isWaiting) return;
            isWaiting = true;

            fetch(`${API_BASE}&action=adminGetChat&userId=${mobile}&lastTimestamp=${lastTime}&isTyping=${isTyping}&_=${Date.now()}`)
                .then(r => r.json())
                .then(res => {
                    isWaiting = false;
                    if (res.typing) typingInd.style.display = "block";
                    else typingInd.style.display = "none";

                    if (res.data && res.data.length > 0) {
                        res.data.forEach(m => {
                            if (m.timestamp > lastTime) {
                                addMessage(m.message, m.sender, m.timestamp);
                                lastTime = m.timestamp;
                                if (m.sender === 'admin' && !win.classList.contains('active')) {
                                    unreadCount++;
                                    badge.innerText = unreadCount;
                                    badge.style.display = "flex";
                                }
                            }
                        });
                    }
                })
                .catch(() => isWaiting = false);
        }

        // هندل کردن تشخیص در حال تایپ
        input.addEventListener('input', () => {
            isTyping = true;
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => isTyping = false, 2000);
        });

        // آپلود عکس
        const fileInput = document.getElementById('mz-file-input');
        document.getElementById('mz-attach-btn').addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const b64 = ev.target.result;
                addMessage("[IMG]" + b64, "user", null);
                fetch(`${MZ_SERVER_URL}?userId=${mobile}&sender=user&license=${lk}&originDomain=${originDomain}`, {
                    method: "POST", body: "[IMG]" + b64, mode: "no-cors"
                });
            };
            reader.readAsDataURL(file);
        });

        // ضبط صدا (ویس)
        const micBtn = document.getElementById('mz-mic-btn');
        const audioPrev = document.getElementById('mz-audio-preview');
        micBtn.addEventListener('click', async () => {
            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
                micBtn.classList.remove('recording');
            } else {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];
                    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
                    mediaRecorder.onstop = () => {
                        const blob = new Blob(audioChunks, { type: 'audio/webm' });
                        const reader = new FileReader();
                        reader.readAsDataURL(blob);
                        reader.onloadend = () => {
                            pendingAudioBase64 = reader.result;
                            audioPrev.style.display = "flex";
                        };
                    };
                    mediaRecorder.start();
                    micBtn.classList.add('recording');
                } catch (err) { alert("اجازه دسترسی به میکروفون داده نشد."); }
            }
        });

        document.getElementById('mz-cancel-audio').addEventListener('click', () => {
            audioPrev.style.display = "none";
            pendingAudioBase64 = null;
        });

        document.getElementById('mz-send-audio').addEventListener('click', () => {
            if (pendingAudioBase64) {
                addMessage("[AUDIO]" + pendingAudioBase64, "user", null);
                fetch(`${MZ_SERVER_URL}?userId=${mobile}&sender=user&license=${lk}&originDomain=${originDomain}`, {
                    method: "POST", body: "[AUDIO]" + pendingAudioBase64, mode: "no-cors"
                });
                audioPrev.style.display = "none";
                pendingAudioBase64 = null;
            }
        });

        function startPolling() {
            fetchUpdates();
            setInterval(fetchUpdates, 3000);
        }

        // اجرای اولیه
        if (mobile) checkAuth();
    }

    // اطمینان از لود شدن DOM
    if (document.readyState === 'complete') initMzWidget();
    else window.addEventListener('load', initMzWidget);
})();
