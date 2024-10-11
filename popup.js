wodocument.getElementById("mon-bouton").addEventListener("click", async function() {
  chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      if (tabs.length > 0) {
          const activeTab = tabs[0].id;
          console.log(tabs.length);
          // Exécution du script après le délai
          chrome.scripting.executeScript({
            target: {tabId: activeTab},
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

  const AcceptButtonKeyWords = ['accepter', 'accept', 'allow'];
  const DenyButtonKeyWords = ['refuser', 'refuse', 'sans accepter', 'deny', 'without', 'reject', 'decline'];
  const CookieBannerKeyWords = ['cookie'];

  function keyWordIsIncluded(keyword_list, element) {
    result = false;
    keyword_list.forEach(keyword => {
      if ( element.textContent.toLowerCase().includes(keyword) ) {
        result = true;
      }
    });
    return result;
  }

  function getCookieDivs(){ //RETURN COOKIE DIVS WITHOUT PARENT DIVS.
    console.log("Détection des bannières de cookies dans la page...");
    //get all elements of the page
    const divs = document.querySelectorAll('div');
    const cookieDivs = [];
    console.log(divs.length);
    //get all elements containing the word "cookie"
    divs.forEach(element => {
      //seach for the cookie banner div
      if ( keyWordIsIncluded(CookieBannerKeyWords, element) ) {
        console.log("cookie banner");
        cookieDivs.push(element);
      }
    });
    //get the element of the list that is at the maximal depth.
    const elementToDelete = [];
    cookieDivs.forEach(element => {
      for (const child of element.children) {
        if ( cookieDivs.includes(child)  && !(elementToDelete.includes(element)) ) {
          elementToDelete.push(element);
          console.log("delete parent");
        }
      }
    });
    elementToDelete.forEach(element => {
      cookieDivs.pop(element);
    });
    console.log(cookieDivs.length);
    cookieDivs.forEach(div => {
      console.log(div.textContent);
    });
    return cookieDivs;
  }

  function clickButton(role, cookieBanners){
    if (role == "ACCEPTER") { keyWord_list = AcceptButtonKeyWords; }
    if (role == "REFUSER") { keyWord_list = DenyButtonKeyWords; }
    done = false;
    cookieBanners.forEach(cookieBanner => {
      //seach for the cookie banner div
      if ( done != true ) {
        const buttons = cookieBanner.querySelectorAll('button, a, span');
        buttons.forEach(button => {
          if (keyWordIsIncluded(keyWord_list, button) && button.textContent.length<60) {
            button.click();
            done = true;
            console.log("Bouton cliqué");
            console.log(button.textContent);
          }
        });
      }
    });
    return done;
  }

  function widthSearchWithChildren(cookieDivs){
    const sameOrLowerDepthElements = [];
    cookieDivs.forEach(element => {
      parent=element.parent;
      for (const child of element.children) {
        sameOrLowerDepthElements.push(element);
      }
    });
    cookieDivs.forEach(cookieBanner => {
      for (const child of element.children) {
        cookieDivs.push(child);
      }
    });
    return sameOrLowerDepthElements;
  }

  done = false;
  done = clickButton("ACCEPTER", getCookieDivs());
  if (done) {
    console.log("Terminé.");
  }

}
