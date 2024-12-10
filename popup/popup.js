//Project Consentomatic
//STI INSA Centre-Val de Loire, 2024-2025.
//Titouan GODARD, Léopold MOSSER, Julian HOURNON, Léandro DOS SANTOS.

//popup.js

document.addEventListener("DOMContentLoaded", function() {
    const cookieSwitch = document.querySelector(".Cookie_Switch input"); 
    const cookieSwitchTextElement = document.querySelector(".Cookie_Switch");
    //When checked => Role=DENY
    //When unchecked => Role=ACCEPT

    //initialisation selon la valeur du ROLE stockée.
    chrome.runtime.sendMessage({type:'CONSENTOMATIQUE:InitPopupStatus'});

    
    //Event to detect ioncoming message that tells to change the status of the cookie switch to accept
    chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
        if(msg.type === 'CONSENTOMATIQUE:SetPopupStatus=ACCEPT') {
            cookieSwitch.checked=false;
            updateCookieSwitch();
        }
    });

    //Event to detect ioncoming message that tells to change the status of the cookie switch to deny
    chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
        if(msg.type === 'CONSENTOMATIQUE:SetPopupStatus=DENY') {
            cookieSwitch.checked=true;
            updateCookieSwitch();
        }
    });

    //Event to detect any change on the cookie switch
    cookieSwitch.addEventListener("change", function() {
        updateCookieSwitch();
        if (cookieSwitch.checked) { chrome.runtime.sendMessage({type:'CONSENTOMATIQUE:SetROLE=DENY'}); } //change role to deny
        else { chrome.runtime.sendMessage({type:'CONSENTOMATIQUE:SetROLE=ACCEPT'}); } //change role to accept
    });

    function updateCookieSwitch() {
        //function that update the cookie switch style
        if (!cookieSwitch.checked) {
            cookieSwitchTextElement.classList.remove("text-red");
            cookieSwitchTextElement.classList.add("text-green");
            cookieSwitchTextElement.textContent="Cookies (accepter tout)";
        } else {
            cookieSwitchTextElement.classList.remove("text-green");
            cookieSwitchTextElement.classList.add("text-red");
            cookieSwitchTextElement.textContent="Cookies (refuser tout)";
        }
    }
});