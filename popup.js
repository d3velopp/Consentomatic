document.getElementById("mon-bouton").addEventListener("click", async function() {
  chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      if (tabs.length > 0) {
          const activeTab = tabs[0].id;
          console.log(tabs.length);
          // Exécution du script
          chrome.scripting.executeScript({
            target: {tabId: activeTab, allFrames: true},
            func: Consentomatic
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




function Consentomatic() {

  const AcceptButtonKeyWords = ['accepter', 'accept', 'allow', 'je comprends'];
  const WrongAcceptKeyWords = ['acceptable', 'sans accepter', 'without']
  const DenyButtonKeyWords = ['refuser', 'refuse', 'sans accepter', 'deny', 'without', 'reject', 'decline', 'rejeter'];
  const CookieBannerKeyWords = ['cookie', 'privacy', 'personal data'];

  function keyWordIsIncluded(keyword_list, element) {
    result = false;
    keyword_list.forEach(keyword => {
      if (element.textContent.toLowerCase().includes(keyword)) {
        result = true;
      }
    });
    return result;
  }

  function getCookieDivs(){ //RETURN COOKIE DIVS WITHOUT PARENT DIVS.
    //get all elements of the page
    const divs = document.querySelectorAll('div');
    const cookieDivs = [];
    //get all elements containing the word "cookie"
    divs.forEach(element => {
      //seach for the cookie banner div
      if (keyWordIsIncluded(CookieBannerKeyWords, element)) {
        cookieDivs.push(element);
      }
    });
    //get the element of the list that is at the maximal depth.
    const elementToDelete = [];
    cookieDivs.forEach(element => {
      for (const child of element.children) {
        if (cookieDivs.includes(child)  && !(elementToDelete.includes(element))) {
          elementToDelete.push(element);
        }
      }
    });
    elementToDelete.forEach(element => {
      cookieDivs.pop(element);
    });
    console.log("Nombre de Divs selectionnées :",cookieDivs.length);
    cookieDivs.forEach(div => {
      console.log(cookieDivs.textContent);
    });
    return cookieDivs;
  }

  function clickButton(role, cookieBanners){
    done = false;
    cookieBanners.forEach(cookieBanner => {
      //seach for the cookie banner div
      const buttons = cookieBanner.querySelectorAll('button, a, span, div');
      buttons.forEach(button => {
        if (role == "ACCEPTER") {
          if (keyWordIsIncluded(AcceptButtonKeyWords, button) && button.textContent.length<100 && !(keyWordIsIncluded(WrongAcceptKeyWords, button)) ) { // pour bloquer des mots clés selon notre expérience (par exemple 'acceptable' pose un problème sur easyjet).
            button.click();
            done = true;
            console.log("Bouton ACCEPTER cliqué :", button.textContent);
          }
        }
        else if (role == "REFUSER") {
          if (keyWordIsIncluded(DenyButtonKeyWords, button) && button.textContent.length<100) {
            button.click();
            done = true;
            console.log("Bouton REFUSER cliqué :", button.textContent);
          }
        }
      });
    });
    return done;
  }

  done = false;
  done = clickButton("ACCEPTER", getCookieDivs());
  if (done) { console.log("Terminé."); }
  else { 
    console.log("Recherche dans les parents");
    parentDivs = [];
    parentDivs = getCookieDivs(); 
    i = 0;
    while ( !(done) && i<10 ) {
      newParentDivs = [];
      parentDivs.forEach(div => {
        newParentDivs.push(div.parent);
      });
      parentDivs = newParentDivs;
      done = clickButton("ACCEPTER", parentDivs);
      i = i+1;
    }
    if (done) { console.log("Terminé."); }
    else { console.log("Echec : Impossible de terminer l'opération dans cette frame."); }
  }
}

