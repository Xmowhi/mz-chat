(function() {
    function initMzWidget() {
        if (document.getElementById('mz-chat-main-wrapper')) return;

        const scripts = document.getElementsByTagName('script');
        let lk = null;
        for (let i = 0; i < scripts.length; i++) {
            let dataL = scripts[i].getAttribute('data-license');
            if (dataL) { lk = dataL; break; }
        }

        if (!lk) {
            console.error("MozheBazar: License Key Missing!");
            return;
        }

        const originDomain = window.location.hostname.replace(/^www\./, '');
        const MZ_SERVER_URL = "https://script.google.com/macros/s/AKfycbxvfpKr_kQqjsiNhdDiuSehvn-mJBtrGuE37n6pzVciNzNX9Z4kzs3Kgw-DiW6mXjG1/exec";
        const API_BASE = `${MZ_SERVER_URL}?license=${lk}&originDomain=${originDomain}`;

        const st = document.createElement('style');
        st.innerHTML = `
        #mz-chat-main-wrapper { all: initial; font-family: Tahoma, sans-serif; direction: rtl; }
        .mz-chat-bubble {
            position: fixed !important; 
            bottom: 85px !important; /* اعمال فاصله ۷۵ پیکسلی مدنظر شما */
            right: 20px !important; 
            width: 60px !important; 
            height: 60px !important; 
            background: #185ABC !important; 
            border-radius: 50% !important; 
            display: flex !important; 
            align-items: center !important; 
            justify-content: center !important; 
            cursor: pointer !important; 
            z-index: 2147483647 !important; /* بالاترین اولویت لایه‌بندی */
            box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
            visibility: visible !important; 
            opacity: 1 !important;
            transition: transform 0.2s !important;
        }
        .mz-chat-window {
            position: fixed !important; 
            bottom: 155px !important; /* پنجره چت هم متناسب با دکمه بالاتر آمد */
            right: 20px !important;
            width: 350px !important; 
            max-width: 90vw !important; 
            height: 500px !important;
            max-height: 65vh !important; 
            background: #fff !important; 
            border-radius: 15px !important;
            box-shadow: 0 5px 25px rgba(0,0,0,0.2) !important; 
            z-index: 2147483647 !important;
            display: flex; flex-direction: column; overflow: hidden;
            transform: scale(0.8); opacity: 0; visibility: hidden;
            transform-origin: bottom right; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .mz-chat-window.active { transform: scale(1); opacity: 1; visibility: visible; }
        .mz-chat-header { background: #185ABC; color: #fff; padding: 15px; font-weight: bold; text-align: center; }
        .mz-chat-body { flex-grow: 1; padding: 15px; overflow-y: auto; background: #f4f7f9; display: flex; flex-direction: column; }
        .mz-chat-msg { padding: 10px 14px; border-radius: 12px; margin-bottom: 10px; max-width: 80%; font-size: 14px; line-height: 1.5; word-wrap: break-word; }
        .mz-msg-user { background: #185ABC; color: #fff; align-self: flex-start; border-bottom-right-radius: 2px; text-align: right; margin-right: auto; }
        .mz-msg-admin { background: #fff; color: #333; align-self: flex-end; border-bottom-left-radius: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: right; margin-left: auto; }
        .mz-chat-form { display: flex; padding: 10px; background: #fff; border-top: 1px solid #eee; gap: 5px; align-items: center; }
        .mz-chat-input { flex: 1; border: 1px solid #ddd; border-radius: 20px; padding: 8px 15px; outline: none; font-size: 14px; direction: rtl; }
        .mz-chat-send-btn { background: #185ABC; color: #fff; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display:flex; align-items:center; justify-content:center; }
        .mz-auth-screen { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 20px; text-align: center; }
        .mz-auth-input { border: 1px solid #ddd; border-radius: 10px; padding: 10px; margin-bottom: 10px; text-align: center; font-size: 16px; }
        .mz-auth-btn { background: #185ABC; color: #fff; border: none; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: bold; }
        .mz-badge { position: absolute; top: -5px; right: -5px; background: red; color: #fff; border-radius: 50%; width: 22px; height: 22px; font-size: 11px; display: none; align-items: center; justify-content: center; border: 2px solid #fff; }
        `;
        document.head.appendChild(st);

        const wrapper = document.createElement('div');
        wrapper.id = 'mz-chat-main-wrapper';
        wrapper.innerHTML = `
            <div class="mz-chat-bubble" id="mz-chat-toggle">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                <div class="mz-badge" id="mz-badge">0</div>
            </div>
            <div class="mz-chat-window" id="mz-chat-window">
                <div class="mz-chat-header">پشتیبانی آنلاین</div>
                <div id="mz-auth-box" class="mz-auth-screen">
                    <p style="font-size:13px; color:#666; margin-bottom:15px;">برای شروع گفتگو شماره موبایل خود را وارد کنید</p>
                    <input type="tel" id="mz-phone" class="mz-auth-input" placeholder="09xxxxxxxxx" maxlength="11">
                    <button id="mz-login-btn" class="mz-auth-btn">ورود</button>
                </div>
                <div id="mz-chat-box" style="display:none; flex-direction:column; height:100%;">
                    <div class="mz-chat-body" id="mz-history">
                        <div class="mz-chat-msg mz-msg-admin">سلام! چطور میتونم کمکتون کنم؟</div>
                    </div>
                    <form class="mz-chat-form" id="mz-form">
                        <input type="text" id="mz-input" class="mz-chat-input" placeholder="پیام شما..." autocomplete="off">
                        <button type="submit" class="mz-chat-send-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:rotate(180deg)"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(wrapper);

        const toggle = document.getElementById('mz-chat-toggle'),
              windowEl = document.getElementById('mz-chat-window'),
              history = document.getElementById('mz-history'),
              authBox = document.getElementById('mz-auth-box'),
              chatBox = document.getElementById('mz-chat-box'),
              phoneInput = document.getElementById('mz-phone'),
              loginBtn = document.getElementById('mz-login-btn'),
              form = document.getElementById('mz-form'),
              input = document.getElementById('mz-input'),
              badge = document.getElementById('mz-badge');

        let userMobile = localStorage.getItem('mz_mobi_' + lk),
            lastTs = 0, isFetching = false, unread = 0;

        function showCorrectBox() {
            if (userMobile) {
                authBox.style.display = 'none';
                chatBox.style.display = 'flex';
                startPolling();
            } else {
                authBox.style.display = 'flex';
                chatBox.style.display = 'none';
            }
        }

        toggle.addEventListener('click', () => {
            windowEl.classList.toggle('active');
            if (windowEl.classList.contains('active')) {
                unread = 0; badge.style.display = 'none';
                showCorrectBox();
                setTimeout(() => history.scrollTop = history.scrollHeight, 100);
            }
        });

        loginBtn.addEventListener('click', () => {
            const m = phoneInput.value.trim();
            if (/^09\d{9}$/.test(m)) {
                userMobile = m;
                localStorage.setItem('mz_mobi_' + lk, m);
                showCorrectBox();
            } else alert("شماره معتبر نیست");
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const txt = input.value.trim();
            if (!txt) return;
            addMsg(txt, 'user', null);
            input.value = '';
            fetch(`${MZ_SERVER_URL}?userId=${userMobile}&sender=user&license=${lk}&originDomain=${originDomain}`, {
                method: 'POST', body: txt, mode: 'no-cors'
            });
        });

        function addMsg(m, s, ts) {
            if (ts !== null) {
                const locals = history.querySelectorAll('.mz-local');
                locals.forEach(el => { if (el.innerText === m) el.remove(); });
            }
            const d = document.createElement('div');
            d.className = `mz-chat-msg ${s === 'user' ? 'mz-msg-user' : 'mz-msg-admin'}`;
            if (ts === null) d.classList.add('mz-local');
            d.innerText = m;
            history.appendChild(d);
            history.scrollTop = history.scrollHeight;
        }

        function poll() {
            if (!userMobile || isFetching) return;
            isFetching = true;
            fetch(`${API_BASE}&action=adminGetChat&userId=${userMobile}&lastTimestamp=${lastTs}&_=${Date.now()}`)
                .then(r => r.json())
                .then(res => {
                    isFetching = false;
                    if (res.data && res.data.length > 0) {
                        res.data.forEach(msg => {
                            if (msg.timestamp > lastTs) {
                                addMsg(msg.message, msg.sender, msg.timestamp);
                                lastTs = msg.timestamp;
                                if (msg.sender === 'admin' && !windowEl.classList.contains('active')) {
                                    unread++; badge.innerText = unread; badge.style.display = 'flex';
                                }
                            }
                        });
                    }
                }).catch(() => isFetching = false);
        }

        function startPolling() {
            poll();
            setInterval(poll, 4000);
        }
    }

    if (document.readyState === 'complete') initMzWidget();
    else window.addEventListener('load', initMzWidget);
})();
