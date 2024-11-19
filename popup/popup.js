document.addEventListener("DOMContentLoaded", function() {
    const cookieSwitch = document.querySelector(".Cookie_Switch input"); 
    //When checked => Role=DENY
    //When unchecked => Role=ACCEPT

    //initialisation selon la valeur du ROLE stockée.
    chrome.runtime.sendMessage({type:'CONSENTOMATIC:GetPopupStatus'});

    chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
        if(msg.type === 'CONSENTOMATIC:SetPopupStatus=ACCEPT') {
            console.log("CONSENTOMATIC:SetPopupStatus=ACCEPT");
            document.querySelector(".Cookie_Switch input").checked=false;
            updateElement(cookieSwitch, document.querySelector(".Cookie_Switch"));
        }
    });

    chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
        if(msg.type === 'CONSENTOMATIC:SetPopupStatus=DENY') {
            console.log("CONSENTOMATIC:SetPopupStatus=DENY");
            document.querySelector(".Cookie_Switch input").checked=true;
            updateElement(cookieSwitch, document.querySelector(".Cookie_Switch"));
        }
    });

    // Initial state
    updateElement(cookieSwitch, document.querySelector(".Cookie_Switch"));

    cookieSwitch.addEventListener("change", function() {
        const cookieText = document.querySelector(".Cookie_Switch");
        updateElement(cookieSwitch, cookieText);
    });

    function updateElement(switchElement, textElement) {
        if (!switchElement.checked) {
            textElement.classList.remove("text-red");
            textElement.classList.add("text-green");
            chrome.runtime.sendMessage({type:'CONSENTOMATIC:SetROLE=ACCEPT'}); //change role to accept
        } else {
            textElement.classList.remove("text-green");
            textElement.classList.add("text-red");
            chrome.runtime.sendMessage({type:'CONSENTOMATIC:SetROLE=DENY'}); //change role to deny
        }
    }
});