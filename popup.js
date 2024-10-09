document.getElementById("mon-bouton").addEventListener("click", async function() {
  chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      if (tabs.length > 0) {
          const activeTab = tabs[0].id;
          console.log(tabs.length);
          // Exécution du script après le délai
          chrome.scripting.executeScript({
            target: {tabId: activeTab},
            func: detectCookieBanners
          }, (results) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            } else {
              console.log('Script exécuté avec succès', results);
            }
          });
          
      } else {
          console.error("Aucun onglet actif trouvé.");
      }
  });
});

function detectCookieBanners() {

  function getBanners(){
    //return all banners containing the word "cookie"
    console.log("Détection des bannières de cookies dans la page...");
    const banners = document.querySelectorAll('div, p, span, button, a');
    //console.log(banners.length);
    return banners
  }

  function clickAcceptButton(banner){
    done = false;
    const buttons = banner.querySelectorAll('button, a, span');
    buttons.forEach(button => {
      if ( done != true && button.textContent.toLowerCase().includes("accept")) {
        button.click();
        console.log("Bouton Accepter cliqué");
        done = true;
      }
    });
    return done;
  }

  done = false;
  banners=getBanners()
  banners.forEach(banner => {
      console.log("banner")
      //seach for the cookie banner div
      if ( done != true && banner.textContent.toLowerCase().includes('cookies')) {
        console.log("cookie banner");
        //now we are in the cookie banner div
        done = clickAcceptButton(banner); //get the accept button and click
      }
  });

}