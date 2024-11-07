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

  function getZIndex(element) {
    return parseFloat(window.getComputedStyle(element).zIndex) || 0;
  }

  const banners = document.querySelectorAll('span, button, a, div');
  let btn = [];
  let Z = [];

  // Filtrer les éléments contenant "accepter"
  banners.forEach(banner => {
    console.log(banner);
    if (banner.textContent.toLowerCase().includes('accepter')) {
      console.log(banner);
      btn.push(banner); // Ajouter l'élément au tableau de boutons
      Z.push(getZIndex(banner)); // Ajouter son z-index au tableau Z
      console.log(banner.textContent);
      banner.click();
    }
  });
  
  if (Z.length > 0) {
    // Trouver l'index du bouton avec le z-index le plus élevé
    let maxZIndex = Math.max(...Z);
    let id_max = Z.indexOf(maxZIndex);

    // Cliquer sur le bouton ayant le z-index maximum
    btn[id_max].click();
    console.log(id_max);
    console.log("Clique sur le bouton avec z-index le plus élevé.");
  } else {
    console.log("Aucun bouton contenant 'accepter' n'a été trouvé.");
  }
  
  
}