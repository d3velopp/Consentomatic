//Project Consentomatique
//STI INSA Centre-Val de Loire, 2024-2025.
//Titouan GODARD, Léopold MOSSER, Julian HOURNON, Léandro DOS SANTOS.

//role.js

function setRole(role) {
    //function to set the role in the local storage
    importantLog("ROLE => " + role);
    chrome.storage.local.set({ Consentomatic_ROLE: role });
}

async function getRole() {
    //async function to get the role from the local storage
    var tmp = await chrome.storage.local.get(["Consentomatic_ROLE"]);
    return tmp.Consentomatic_ROLE;
}