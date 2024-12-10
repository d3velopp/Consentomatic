//Project Consentomatique
//STI INSA Centre-Val de Loire, 2024-2025.
//Titouan GODARD, Léopold MOSSER, Julian HOURNON, Léandro DOS SANTOS.

//background.js

try {
    importScripts('./consentomatique.js', './domain.js', './role.js', './history.js');
} catch (e) {
    console.error(e);
}

const FACULTATIVE_LOGS_ALLOWED = false;
const IMPORTANT_LOGS_ALLOWED = true;

chrome.runtime.onInstalled.addListener(() => { //initialisation
    importantLog("Consentomatique Installed !");
    setRole("DENY");
    clearHistory();
    facultativeLog("Background worker initialized");
});

//#########################################################################
//Detect Runtime Messages
//#########################################################################
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    //## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
    //Event for starting the consentomatic function
    //## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
    if(msg.type === 'CONSENTOMATIQUE:Execute') {
        facultativeLog("Message : Execute");
        //Get the current tab.
        chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
            if (tabs.length > 0) {
                //Get Domain
                var domain = await getDomain(tabs[0].id);
                var role = await getRole();
                var keepCalling = true;
                var success = false;
                var loopAfterSuccess = 0;
                var buttonText = [];
                var resultDomain = "";
                importantLog("Executing Consentomatique on " + domain);
                setTimeout(() => keepCalling=false, 15*1000); //keepCalling stays true for 20 seconds.
                while (keepCalling && loopAfterSuccess < 10) {
                    if (success) loopAfterSuccess++;
                    results = await start_consentomatique(tabs[0].id, role, 50);
                    // console.log(results);
                    results.forEach((result) => {
                        if (result!=null){
                            console.log("r:", result);
                            success=(result.result[0]=='SUCCESS' || success) //test if the result of the main function is "SUCCESS"
                            if (result.result[0]=='SUCCESS' && !buttonText.includes(result.result[2])) buttonText.push(result.result[2])
                            if (result.result[0]=='SUCCESS') resultDomain = result.result[1];
                        }
                    });
                }
                if (success) { 
                    success="SUCCESS";
                    domain=resultDomain;
                }
                else success="FAILURE"
                importantLog(domain + " : " + success + " : " + role + " : " + buttonText);
                addToHistory(domain, success, role, buttonText);
            }
        });
    }
    //## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
    //Event for the initialization of the popup
    //## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
    if(msg.type === 'CONSENTOMATIQUE:InitPopupStatus') {
        facultativeLog("Message : InitPopupStatus");
        //get the role from the storage and communicate it to the popup
        role = await getRole();
        if (role=="ACCEPT"){
            chrome.runtime.sendMessage({type:'CONSENTOMATIQUE:SetPopupStatus=ACCEPT'});
            facultativeLog('CONSENTOMATIQUE:SetPopupStatus=ACCEPT');
        }
        else if (role=="DENY"){
            chrome.runtime.sendMessage({type:'CONSENTOMATIQUE:SetPopupStatus=DENY'});
            facultativeLog('CONSENTOMATIQUE:SetPopupStatus=DENY');
        }
        else {
            //if role is Undefined (which should never happend), set to DENY.
            setRole("DENY");
            chrome.runtime.sendMessage({type:'CONSENTOMATIQUE:SetPopupStatus=DENY'});
            facultativeLog('CONSENTOMATIQUE:SetPopupStatus=DENY');
        }
    }
    //## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
    //Event for changing role to ACCEPT
    //## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
    if(msg.type === 'CONSENTOMATIQUE:SetROLE=ACCEPT') {
        facultativeLog("Message : SetROLE => ACCEPT");
        setRole("ACCEPT");
    }
    //## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
    //Event for changing role to DENY
    //## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ## ##
    if(msg.type === 'CONSENTOMATIQUE:SetROLE=DENY') {
        facultativeLog("Message : SetROLE => DENY");
        setRole("DENY");
    }
});


function facultativeLog(text) {
    //function to print facultative logs in the console
    if (FACULTATIVE_LOGS_ALLOWED == true) {
        console.log("---------> "+text);
    }
}

function importantLog(text) {
    //function to print important logs in the console
    if (IMPORTANT_LOGS_ALLOWED == true) {
        console.log(text);
    }
}