(function(){
    function initMzWidget() {
        // جلوگیری از لود تکراری
        if(document.getElementById('mz-chat-main-wrapper')) return;

        const scripts = document.getElementsByTagName('script');
        let lk = null;
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].getAttribute('data-license')) {
                lk = scripts[i].getAttribute('data-license');
                break;
            }
        }
        
        // اگر لایسنس پیدا نشد (برای تست دستی، لایسنس را اینجا جایگزین کنید)
        if(!lk) { 
            console.warn("MozheBazar: License Key Missing. Trying default...");
            // lk = "YOUR_TEST_LICENSE_HERE"; // اگر می‌خواهید دستی تست کنید این خط را فعال کنید
            if(!lk) return; 
        }

        const originDomain = window.location.hostname.replace(/^www\./, '');
        const MZ_SERVER_URL = "https://script.google.com/macros/s/AKfycbxvfpKr_kQqjsiNhdDiuSehvn-mJBtrGuE37n6pzVciNzNX9Z4kzs3Kgw-DiW6mXjG1/exec";
        const API_BASE = `${MZ_SERVER_URL}?license=${lk}&originDomain=${originDomain}`;

        const st = document.createElement('style');
        st.innerHTML = `
        .mz-chat-bubble{position:fixed;bottom:85px;right:20px;width:60px;height:60px;background:#185ABC;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 15px rgba(24,90,188,0.4);z-index:999998!important;transition:transform .2s}
        .mz-chat-bubble:hover{transform:scale(1.1)}
        .mz-chat-badge{position:absolute;top:-5px;right:-5px;background:#f44336;color:#fff;border-radius:50%;width:22px;height:22px;font-size:12px;font-weight:700;display:none;align-items:center;justify-content:center;border:2px solid #fff}
        .mz-chat-window{position:fixed;bottom:155px;right:20px;width:350px;max-width:calc(100vw - 40px);height:500px;max-height:calc(100vh - 280px);background:#fff;border-radius:15px;box-shadow:0 5px 25px rgba(0,0,0,.15);z-index:999999!important;display:flex;flex-direction:column;overflow:hidden;transform:scale(.8);opacity:0;visibility:hidden;transform-origin:bottom right;transition:all .3s cubic-bezier(.175,.885,.32,1.275);box-sizing:border-box}
        .mz-chat-window.active{transform:scale(1);opacity:1;visibility:visible}
        .mz-chat-header{background:#185ABC;color:#fff;padding:15px;font-weight:700;text-align:center;flex-shrink:0;box-sizing:border-box}
        .mz-chat-body{flex-grow:1;padding:15px;overflow-y:auto;background:#f3f4f6;-webkit-overflow-scrolling:touch;position:relative;box-sizing:border-box;direction:rtl}
        .mz-chat-msg{padding:10px 15px;border-radius:12px;margin-bottom:10px;max-width:80%;line-height:1.5;word-wrap:break-word;font-size:14px;direction:rtl}
        .mz-msg-user{background:#185ABC;color:#fff;margin-left:auto;border-bottom-right-radius:2px}
        .mz-msg-admin{background:#fff;color:#333;margin-right:auto;border-bottom-left-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
        .mz-chat-msg img{max-width:100%;border-radius:8px;margin-top:5px;display:block}
        .mz-chat-form{display:flex;padding:10px;background:#fff;border-top:1px solid #f0f2f5;align-items:center;gap:6px;flex-shrink:0;width:100%;box-sizing:border-box;direction:rtl}
        .mz-chat-input-wrapper{flex:1;min-width:0;display:flex;align-items:center;background:#f4f5f7;border-radius:24px;padding:4px 8px;border:1px solid transparent;transition:0.3s;box-sizing:border-box}
        .mz-chat-input-wrapper:focus-within{border-color:#185ABC;background:#fff;box-shadow:0 0 0 3px rgba(24,90,188,0.1)}
        .mz-chat-input{flex:1;min-width:0;border:none;background:transparent;padding:8px 5px;font-size:14px;font-family:inherit;outline:none;color:#333}
        .mz-chat-input::placeholder{color:#999}
        .mz-chat-action-btn{background:0 0;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#7a7a7a;padding:6px;border-radius:50%;transition:0.2s;flex-shrink:0}
        .mz-chat-action-btn:hover{color:#185ABC;background:rgba(24,90,188,0.1)}
        .mz-chat-action-btn.recording{color:#f44336;animation:mz-pulse 1.2s infinite;background:rgba(244,67,54,0.1)}
        .mz-chat-send-btn{width:40px;height:40px;border-radius:50%;background:#185ABC;color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;box-shadow:0 2px 8px rgba(24,90,188,0.3);transition:0.2s;padding:0}
        .mz-chat-send-btn:hover{background:#144a9c;transform:scale(1.05)}
        @keyframes mz-pulse{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
        .mz-audio-preview{position:absolute;bottom:75px;left:50%;transform:translateX(-50%);background:#fff;padding:10px;border-radius:15px;box-shadow:0 5px 15px rgba(0,0,0,.2);display:none;align-items:center;gap:10px;z-index:30;white-space:nowrap;direction:rtl}
        .mz-audio-preview button{padding:8px 15px;border-radius:20px;border:none;cursor:pointer;font-family:inherit;font-weight:700;font-size:12px}
        .mz-btn-send-audio{background:#185ABC;color:#fff}
        .mz-btn-cancel-audio{background:#f44336;color:#fff}
        .mz-typing-indicator{display:flex;align-items:center;padding:10px 15px;border-radius:12px;margin-bottom:10px;max-width:80%;background:#fff;margin-right:auto;border-bottom-left-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
        .mz-typing-indicator span{height:6px;width:6px;background-color:#9ca3af;border-radius:50%;display:inline-block;margin:0 2px;animation:typing-bounce 1.4s infinite}
        .mz-typing-indicator span:nth-child(2){animation-delay:.2s}
        .mz-typing-indicator span:nth-child(3){animation-delay:.4s}
        @keyframes typing-bounce{0%,100%,80%{transform:scale(0)}40%{transform:scale(1)}}
        .mz-auth-screen{flex-grow:1;display:flex;flex-direction:column;justify-content:center;padding:20px;background:#fff;text-align:center;overflow-y:auto;box-sizing:border-box;direction:rtl}
        .mz-auth-input{border:1px solid #ddd;border-radius:10px;padding:12px;text-align:center;font-size:16px;margin-bottom:15px;direction:ltr;outline:none;width:100%;box-sizing:border-box}
        .mz-auth-btn{background:#185ABC;color:#fff;border:none;padding:12px;border-radius:10px;font-weight:700;cursor:pointer;width:100%;box-sizing:border-box}
        #mz-load-more-btn {background:#e0e0e0;color:#555;border:none;padding:8px 15px;border-radius:20px;cursor:pointer;font-family:inherit;font-size:12px;margin:0 auto 10px;display:none;width: fit-content;align-self: center;}
        `;
        document.head.appendChild(st);

        const wrapper = document.createElement('div');
        wrapper.id = 'mz-chat-main-wrapper';
        wrapper.innerHTML = `
            <div class="mz-chat-bubble" id="mz-chat-toggle"><svg style="width:30px;height:30px;fill:white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><div class="mz-chat-badge" id="mz-chat-badge">0</div></div>
            <div class="mz-chat-window" id="mz-chat-main">
                <div class="mz-chat-header">پشتیبانی آنلاین</div>
                <div id="mz-auth-container" class="mz-auth-screen">
                    <p id="mz-auth-msg" style="font-size:14px;color:#555;margin-bottom:20px;font-weight:bold;">برای شروع گفتگو، لطفاً شماره موبایل خود را وارد کنید</p>
                    <input type="tel" id="mz-phone-input" class="mz-auth-input" placeholder="09xxxxxxxxx" maxlength="11">
                    <button id="mz-phone-submit" class="mz-auth-btn">شروع پشتیبانی</button>
                </div>
                <div id="mz-chat-container" style="display:none;flex-direction:column;height:100%;overflow:hidden;position:relative;">
                    <div class="mz-chat-body" id="mz-chat-history">
                        <button id="mz-load-more-btn">پیام‌های قدیمی‌تر</button>
                        <div id="mz-welcome-msg" class="mz-chat-msg mz-msg-admin">سلام! 👋<br>لطفاً سوال خود را بنویسید؛ ما پاسخگوی شما خواهیم بود.</div>
                        <div class="mz-typing-indicator" id="mz-typing-indicator" style="display:none;"><span></span><span></span><span></span></div>
                    </div>
                    <div class="mz-audio-preview" id="mz-audio-preview">
                        <span style="font-size:12px;color:#666">تایید صدا:</span>
                        <button type="button" id="mz-cancel-audio-btn" class="mz-btn-cancel-audio">لغو</button>
                        <button type="button" id="mz-send-audio-btn" class="mz-btn-send-audio">ارسال</button>
                    </div>
                    <form id="mz-chat-message-form" class="mz-chat-form">
                        <input type="file" id="mz-chat-file" accept="image/*" style="display:none">
                        <div class="mz-chat-input-wrapper">
                            <button type="button" class="mz-chat-action-btn" id="mz-attach-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></button>
                            <input type="text" id="mz-chat-message" class="mz-chat-input" placeholder="پیام خود را بنویسید..." required autocomplete="off">
                            <button type="button" class="mz-chat-action-btn" id="mz-mic-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg></button>
                        </div>
                        <button type="submit" class="mz-chat-send-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: scaleX(-1); margin-right: 2px;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(wrapper);

        const e = document.getElementById("mz-chat-toggle"), t = document.getElementById("mz-chat-main"), n = document.getElementById("mz-chat-history"), a = document.getElementById("mz-chat-message-form"), s = document.getElementById("mz-chat-message"), c = document.getElementById("mz-typing-indicator"), d = document.getElementById("mz-auth-container"), i = document.getElementById("mz-chat-container"), o = document.getElementById("mz-phone-input"), r = document.getElementById("mz-phone-submit"), m = document.getElementById("mz-chat-badge"), l = document.getElementById("mz-chat-file"), attBtn = document.getElementById("mz-attach-btn"), micBtn = document.getElementById("mz-mic-btn"), audioPreview = document.getElementById("mz-audio-preview"), cancelAudioBtn = document.getElementById("mz-cancel-audio-btn"), sendAudioBtn = document.getElementById("mz-send-audio-btn"), loadMoreBtn = document.getElementById("mz-load-more-btn");
        
        let p=localStorage.getItem("mz_chat_mobile_"+lk), chatLastTime=0, oldestMessageTimestamp=null, y=0, b=false, v, M=null, pollTimer=null, isLoadingMore=false, hasMoreOlderMessages=true, mr, aC=[], iR=false, mT, pendingAudio=null, w=false;

        function initA(){if(!M)M=new(window.AudioContext||window.webkitAudioContext)();if("suspended"===M.state)M.resume();}
        document.addEventListener("click",initA,{once:true}); document.addEventListener("touchstart",initA,{once:true});
        function pB(){if(!M||"suspended"===M.state)return;try{const oNode=M.createOscillator(),gNode=M.createGain();oNode.type="sine";oNode.frequency.setValueAtTime(800,M.currentTime);gNode.gain.setValueAtTime(.5,M.currentTime);gNode.gain.exponentialRampToValueAtTime(.01,M.currentTime+.3);oNode.connect(gNode);gNode.connect(M.destination);oNode.start();oNode.stop(M.currentTime+.3);}catch(err){}}
        function f(){if(p){d.style.display="none";i.style.display="flex";}else{d.style.display="flex";i.style.display="none";}}

        e.addEventListener("click",()=>{
            t.classList.toggle("active");
            if(t.classList.contains("active")){
                m.style.display="none"; y=0; f(); E(); 
            }
        });

        r.addEventListener("click",()=>{
            const phoneVal=o.value.trim();
            if(/^09\d{9}$/.test(phoneVal)){
                localStorage.setItem("mz_chat_mobile_"+lk,phoneVal); p=phoneVal; chatLastTime=0; oldestMessageTimestamp=null; hasMoreOlderMessages=true;
                document.querySelectorAll('.mz-chat-msg:not(#mz-welcome-msg)').forEach(el=>el.remove()); initA(); f(); E(); startPolling();
            } else { alert("شماره موبایل نامعتبر است."); }
        });

        s.addEventListener("input",()=>{b=true; clearTimeout(v); v=setTimeout(()=>b=false,2000);});

        a.addEventListener("submit",function(event){
            event.preventDefault(); const txt=s.value.trim(); if(!txt)return;
            k(txt,"user",null); s.value=""; b=false;
            fetch(`${MZ_SERVER_URL}?userId=${p}&sender=user&license=${lk}&originDomain=${originDomain}&_=${Date.now()}`,{method:"POST",body:txt,mode:"no-cors"}).catch(()=>{});
        });

        attBtn.addEventListener("click",()=>l.click());

        l.addEventListener("change",function(ev){
            const file=ev.target.files[0]; if(!file)return;
            const reader=new FileReader();
            reader.onload=function(eEvent){
                const img=new Image(); img.src=eEvent.target.result;
                img.onload=function(){
                    const canvas=document.createElement("canvas"); let width=img.width, height=img.height;
                    if(width>600){height*=600/width;width=600;}
                    canvas.width=width; canvas.height=height; const ctx=canvas.getContext("2d"); ctx.drawImage(img,0,0,width,height);
                    const b64=canvas.toDataURL("image/jpeg",0.6);
                    k("[IMG]"+b64,"user",null);
                    fetch(`${MZ_SERVER_URL}?userId=${p}&sender=user&license=${lk}&originDomain=${originDomain}&_=${Date.now()}`,{method:"POST",body:"[IMG]"+b64,mode:"no-cors"}).catch(()=>{});
                };
            };
            reader.readAsDataURL(file);
        });

        micBtn.addEventListener("click",async()=>{
            if (!iR) {
                try {
                    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
                    let mimeType='audio/webm'; if(MediaRecorder.isTypeSupported('audio/mp4'))mimeType='audio/mp4';
                    mr=new MediaRecorder(stream,{mimeType:mimeType}); mr.ondataavailable=e=>aC.push(e.data);
                    mr.onstop=()=>{
                        const blob=new Blob(aC,{type:mimeType}); aC=[];
                        const reader=new FileReader(); reader.readAsDataURL(blob);
                        reader.onloadend=()=>{pendingAudio=reader.result; audioPreview.style.display="flex"; s.placeholder="صدا آماده...";};
                    };
                    mr.start(); iR=true; micBtn.classList.add("recording"); s.placeholder="در حال ضبط...";
                    mT=setTimeout(()=>{if(iR)micBtn.click();},15000);
                } catch(err){alert("دسترسی میکروفون داده نشد");}
            } else { mr.stop(); iR=false; micBtn.classList.remove("recording"); clearTimeout(mT); mr.stream.getTracks().forEach(tr=>tr.stop()); }
        });

        cancelAudioBtn.addEventListener("click",()=>{pendingAudio=null; audioPreview.style.display="none"; s.placeholder="پیام خود را بنویسید...";});

        sendAudioBtn.addEventListener("click",()=>{
            if(!pendingAudio||!p)return;
            k("[AUDIO]"+pendingAudio,"user",null);
            fetch(`${MZ_SERVER_URL}?userId=${p}&sender=user&license=${lk}&originDomain=${originDomain}&_=${Date.now()}`,{method:"POST",body:"[AUDIO]"+pendingAudio,mode:"no-cors"}).catch(()=>{});
            pendingAudio=null; audioPreview.style.display="none"; s.placeholder="پیام خود را بنویسید...";
        });

        function E(){
            if(!p||w)return;
            w = true;
            let fetchUrl=`${API_BASE}&action=adminGetChat&userId=${p}&lastTimestamp=${chatLastTime}&isTyping=${b}&_=${new Date().getTime()}`;
            if (chatLastTime===0) fetchUrl+="&limit=5"; 
            
            fetch(fetchUrl).then(res=>res.json()).then(res=>{
                w = false;
                if(res.error) return; 
                c.style.display=res.typing?"flex":"none"; if(res.typing) n.scrollTop=n.scrollHeight;
                if(res.data&&res.data.length>0){
                    if (chatLastTime===0) {
                        oldestMessageTimestamp=Math.min(...res.data.map(m=>m.timestamp));
                        if(res.data.length<5) {hasMoreOlderMessages=false; loadMoreBtn.style.display="none";} 
                        else {loadMoreBtn.style.display="block";}
                    }
                    let hasNewAdminMsg=false; let maxReceivedTime=chatLastTime;
                    res.data.forEach(msg=>{
                        if(msg.timestamp>chatLastTime){
                            k(msg.message,msg.sender,msg.timestamp);
                            if(chatLastTime>0&&msg.sender==="admin") hasNewAdminMsg=true;
                            if(msg.timestamp>maxReceivedTime) maxReceivedTime=msg.timestamp;
                        }
                    });
                    chatLastTime=maxReceivedTime;
                    if(hasNewAdminMsg){if(!t.classList.contains("active")){y++; m.innerText=y; m.style.display="flex";} pB();}
                } else if(chatLastTime===0){loadMoreBtn.style.display="none";}
            }).catch(err=>{w = false;});
        }

        loadMoreBtn.addEventListener("click",()=>{
            if(!hasMoreOlderMessages||isLoadingMore||!p)return;
            isLoadingMore=true; loadMoreBtn.disabled=true; loadMoreBtn.innerText="درحال بارگذاری...";
            fetch(`${API_BASE}&action=adminGetChat&userId=${p}&limit=5&beforeTimestamp=${oldestMessageTimestamp}&_=${new Date().getTime()}`)
                .then(res=>res.json()).then(res=>{
                    const currentScrollHeight=n.scrollHeight;
                    if(res.data&&res.data.length>0){
                        res.data.reverse().forEach(msg=>{
                            const div=document.createElement("div"); div.className=`mz-chat-msg ${msg.sender==="user"?"mz-msg-user":"mz-msg-admin"}`;
                            if(msg.message.startsWith("[IMG]")){div.innerHTML=`<img src="${msg.message.replace("[IMG]","")}" style="max-width:100%;border-radius:8px;">`;}
                            else if(msg.message.startsWith("[AUDIO]")){div.innerHTML=`<audio controls src="${msg.message.replace("[AUDIO]","")}" style="max-width:100%;height:35px;outline:none;" preload="auto"></audio>`;}
                            else{div.innerText=msg.message;}
                            n.insertBefore(div,loadMoreBtn.nextSibling);
                        });
                        oldestMessageTimestamp=Math.min(...res.data.map(m=>m.timestamp)); n.scrollTop=n.scrollHeight-currentScrollHeight;
                    }
                    if(!res.data||res.data.length<5){hasMoreOlderMessages=false; loadMoreBtn.style.display="none";}
                    isLoadingMore=false; loadMoreBtn.disabled=false; loadMoreBtn.innerText="پیام‌های قدیمی‌تر";
                }).catch(err=>{isLoadingMore=false; loadMoreBtn.disabled=false; loadMoreBtn.innerText="خطا!";});
        });

        function k(textMsg,senderType,timestamp){
            textMsg=String(textMsg||"");
            if(senderType==="user"&&timestamp!==null){
                let localMsgs=n.querySelectorAll(".mz-chat-msg.mz-msg-user.local-msg");
                for(let el of localMsgs){
                    if(el.dataset.rawContent === textMsg){
                        el.remove(); break;
                    }
                }
            }
            const div=document.createElement("div"); div.className=`mz-chat-msg ${senderType==="user"?"mz-msg-user":"mz-msg-admin"}`;
            if(senderType==="user"&&timestamp===null) {
                div.classList.add("local-msg");
                div.dataset.rawContent = textMsg;
            }
            if(textMsg.startsWith("[IMG]")){div.innerHTML=`<img src="${textMsg.replace("[IMG]","")}" style="max-width:100%;border-radius:8px;">`;}
            else if(textMsg.startsWith("[AUDIO]")){div.innerHTML=`<audio controls src="${textMsg.replace("[AUDIO]","")}" style="max-width:100%;height:35px;outline:none;" preload="auto"></audio>`;}
            else{div.innerText=textMsg;}
            c.parentNode.insertBefore(div,c); n.scrollTop=n.scrollHeight;
        }

        function startPolling(){if(pollTimer)clearInterval(pollTimer); pollTimer=setInterval(()=>{if(p)E();},3000);}
        if(p){f(); startPolling(); E();}
    }

    // تغییر مهم: کد بلافاصله بعد از لود شدن DOM اجرا می‌شود
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initMzWidget();
    } else {
        document.addEventListener('DOMContentLoaded', initMzWidget);
    }
    
    window.mzInitWidget = initMzWidget;
})();
