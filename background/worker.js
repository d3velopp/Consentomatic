//Project Consentomatic
//STI INSA Centre-Val de Loire, 2024-2025.
//Titouan GODARD, Léopold MOSSER, Julian HOURNON, Léandro DOS SANTOS.

//worker.js


//This script is runs automatically each time a new website is visited.
//Send a message to the background script to start the execution.
chrome.runtime.sendMessage({type:'CONSENTOMATIQUE:Execute'});