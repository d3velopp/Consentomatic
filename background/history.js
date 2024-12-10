//Project Consentomatique
//STI INSA Centre-Val de Loire, 2024-2025.
//Titouan GODARD, Léopold MOSSER, Julian HOURNON, Léandro DOS SANTOS.

//history.js

async function getHistory() {
    //async function to get the role from the local storage
    var tmp = await chrome.storage.local.get(["Consentomatic_HISTORY"]);
    return tmp.Consentomatic_HISTORY;
}

async function addToHistory(domain, success, role) {
    //async function that add the given values to the history variable in local storage.
    history = await getHistory();
    history.unshift([domain, success, role]); //add the new line at the begenning of the array.
    chrome.storage.local.set({ Consentomatic_HISTORY: history });
    facultativeLog("Added to History : " + domain + " : " + success + " : " + role);
}

function clearHistory() {
    //function to clear the history
    chrome.storage.local.set({ Consentomatic_HISTORY: [] });
    facultativeLog("History clear");
}