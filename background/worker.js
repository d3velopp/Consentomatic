// Function to send message to worker.js
// This script is runs automatically each time a new website is visited.


function call_consentomatic() {
    //Send a message to the background script to start the execution.
    chrome.runtime.sendMessage({type:'CONSENTOMATIC:Execute'});
}

//Call multiple times that function with a delay.
for (let i=0; i<30; i++){
    setTimeout(call_consentomatic, 100*i);
}

