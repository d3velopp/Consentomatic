document.getElementById("mon-bouton").addEventListener("click", async function() {
  chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      if (tabs.length > 0) {
          const activeTab = tabs[0].id;


          console.log("execution");
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
  const banners = document.querySelectorAll('div, p, span');
  banners.forEach(banner => {
      if (banner.textContent.toLowerCase().includes('cookies')) {
          //console.log('Bannière de cookies détectée :', banner);
          const acceptButton = banner.querySelector('button, a');
          if (acceptButton && acceptButton.textContent.toLowerCase().includes("les")) {
              acceptButton.click();
              console.log('Bouton "Accepter" cliqué.');
          }
      }
  });
}
