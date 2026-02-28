(function(){
    function initMzWidget() {
        console.log("1. تابع شروع شد");

        if(document.getElementById('mz-chat-main-wrapper')) {
            console.log("توقف: ویجت قبلاً لود شده");
            return;
        }

        const scripts = document.getElementsByTagName('script');
        let lk = null;
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].getAttribute('data-license')) {
                lk = scripts[i].getAttribute('data-license');
                break;
            }
        }
        
        console.log("2. لایسنس پیدا شده:", lk);

        if(!lk) { 
            console.error("3. توقف: لایسنس پیدا نشد! (data-license را چک کنید)");
            // اگر می‌خواهید برای تست اجباراً اجرا شود، خط زیر را از حالت کامنت خارج کنید:
            // lk = "test_key"; 
            if(!lk) return; 
        }

        const originDomain = window.location.hostname.replace(/^www\./, '');
        console.log("4. دامنه شناسایی شده:", originDomain);

        // تزریق استایل
        try {
            const st = document.createElement('style');
            st.innerHTML = `.mz-chat-bubble{position:fixed;bottom:85px;right:20px;width:60px;height:60px;background:#185ABC;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 15px rgba(24,90,188,0.4);z-index:999999!important;}`;
            document.head.appendChild(st);
            console.log("5. استایل تزریق شد");
        } catch(e) { console.error("خطا در تزریق استایل:", e); }

        // تزریق HTML
        try {
            const wrapper = document.createElement('div');
            wrapper.id = 'mz-chat-main-wrapper';
            wrapper.innerHTML = `<div class="mz-chat-bubble" id="mz-chat-toggle" style="display:flex !important; visibility:visible !important; opacity:1 !important;">
                <svg style="width:30px;height:30px;fill:white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            </div>`;
            document.body.appendChild(wrapper);
            console.log("6. ویجت به Body اضافه شد");
        } catch(e) { console.error("خطا در تزریق HTML:", e); }
    }

    // اجرای فوری برای اطمینان
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initMzWidget();
    } else {
        window.addEventListener('load', initMzWidget);
    }
})();
