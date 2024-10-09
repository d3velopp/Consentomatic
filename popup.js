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
  console.log("Détection des bannières de cookies dans la page...");
  const banners = document.querySelectorAll('div, p, span, button, a');
  console.log(banners.length);
  banners.forEach(banner => {
      //console.log("banner")
      if (banner.textContent.toLowerCase().includes('cookies')) {
          const acceptButton = banner.querySelectorAll('button, a, span, div, p');
          acceptButton.forEach(btn => {
            if ( btn.textContent.toLowerCase().includes("accepter")) {
              btn.click();
              //console.log('Bouton "Accepter" cliqué.');
          }
          })
      }
  });
}