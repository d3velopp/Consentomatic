document.addEventListener("DOMContentLoaded", function() {
    const cookieSwitch = document.querySelector(".Cookie_Switch input"); 
    const cookieSwitchTextElement = document.querySelector(".Cookie_Switch");
    //When checked => Role=DENY
    //When unchecked => Role=ACCEPT

    //initialisation selon la valeur du ROLE stockée.
    chrome.runtime.sendMessage({type:'CONSENTOMATIC:GetPopupStatus'});

    chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
        if(msg.type === 'CONSENTOMATIC:SetPopupStatus=ACCEPT') {
            console.log("CONSENTOMATIC:SetPopupStatus=ACCEPT");
            cookieSwitch.checked=false;
            updateCookieSwitch();
        }
    });

    chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
        if(msg.type === 'CONSENTOMATIC:SetPopupStatus=DENY') {
            console.log("CONSENTOMATIC:SetPopupStatus=DENY");
            cookieSwitch.checked=true;
            updateCookieSwitch();
        }
    });

    // Initial state
    updateCookieSwitch();

    cookieSwitch.addEventListener("change", function() {
        updateCookieSwitch();
    });

    function updateCookieSwitch() {
        if (!cookieSwitch.checked) {
            cookieSwitchTextElement.classList.remove("text-red");
            cookieSwitchTextElement.classList.add("text-green");
            cookieSwitchTextElement.textContent="Cookies (accepter tout)";
            chrome.runtime.sendMessage({type:'CONSENTOMATIC:SetROLE=ACCEPT'}); //change role to accept
        } else {
            cookieSwitchTextElement.classList.remove("text-green");
            cookieSwitchTextElement.classList.add("text-red");
            cookieSwitchTextElement.textContent="Cookies (refuser tout)";
            chrome.runtime.sendMessage({type:'CONSENTOMATIC:SetROLE=DENY'}); //change role to deny
        }
    }
});