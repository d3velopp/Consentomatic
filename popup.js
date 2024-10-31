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


// ###############################################################################################
// ###############################################################################################
// ###############################################################################################


function Consentomatic() {

    //Allow facultative prompts ?
    const DISPLAY = false;
    const DISPLAY_RESULT = true;

    //Keyword Lists
    const AcceptKeyWords = ['accept','allow','consent','confirm','continue','agree', 'activate','autoriser','continuer','accord','comprend']; //identify accept button.
    const WrongAcceptKeyWords = ['acceptable', 'choose', '?', 'sans', 'without', 'if', 'deactivate', 'disagree', 'not', "d'ont"]; //keywords that might trick our program.
    const DenyKeyWords = ['refuser', 'refuse', 'sans accepter', 'deny', 'deactivate', 'without', 'reject', 'decline', 'rejeter', 'interdire']; //identify reject button.
    const CustomiseKeyWords = ['custom', 'choose', 'options', 'set', 'manage', 'gérer', 'configure', 'paramétrer', 'choisis', 'personnaliser']; //identify customise button.
    const PerformanceKeyWords = ['performance'];
    const AdvertisingKeyWords = ['advertising', 'ad', 'publicité'];
    const FunctionalityKeyWords = ['functionality', 'fonctionnalité'];
    const CookieBannerKeyWords = ['cookie', 'privacy', 'personal data', 'gdpr', 'rgpd'];

    //Constants
    BUTTON_TEXT_MAX_LENGTH = 60;
    
    //Variables
    let roots = [];
    let cookieBanners = [];
    let buttons = [];
    let acceptButtons = []; //result with the buttons to accept cookies
    let denyButtons = []; //result with the buttons to reject cookies
    let customiseButtons = []; //result with the buttons to customise cookies


// ###############################################################################################
// ###############################################################################################


    Array.prototype.unique = function() {
        // Method to remove duplicates.
        return Array.from(new Set(this));
    }


    HTMLElement.prototype.directText=function () {
        // Return textContent of current node WITHOUT TEXT OF CHILDREN.
        let el=this.cloneNode(true);
        while (el.children[0]) el.children[0].remove();
        return el.textContent;
    }


    function DisplayElementList(text, list) {
        //display all elements from a list, with a descriptive text.
        if (DISPLAY) {
            list.forEach(element => console.log(text, element));
        }
    }


    function DisplayResult() {
        //display all elements from a list, with a descriptive text.
        if (DISPLAY_RESULT && acceptButtons.length+denyButtons.length+customiseButtons.length > 0) {
            console.log("********************");
            console.log("****** RESULT ******");
            acceptButtons.forEach(element => {
                console.log("ACCEPT BUTTON : ", element);
            });
            denyButtons.forEach(element => {
                console.log("DENY BUTTON : ", element);
            });
            customiseButtons.forEach(element => {
                console.log("CUSTOMISE BUTTON : ", element);
            });
        }
    }


    function NodeOrChildContainsKeyWord(keyword_list, element) {
        //Boolean function that test if a keyword from a list is included in the textContent of an element, including content of children nodes.
        let result = false;
        keyword_list.forEach(keyword => {  
            if (element.innerText!=null){
                if (element.innerText.toLowerCase().includes(keyword)) { 
                    result = true; 
                }
            }
        });
        return result;
    }


    function NodeContainsKeyWord(keyword_list, element) {
        //Boolean function that test if a keyword from a list is included in the textContent of an element, NOT including content of children nodes.
        let result = false;
        elementText=element.directText();
        keyword_list.forEach(keyword => {  
            if (elementText!=null){
                if (elementText.toLowerCase().includes(keyword)) { 
                    result = true; 
                }
            }
        });
        return result;
    }


    function SearchForShadowDOM() {
        //looking for a shadowRoot
        let tmp=[];
        allNodes = document.getElementsByTagName('*');
        for (i = 0; i < allNodes.length; i++) {
            if(allNodes[i].shadowRoot) {
                body = allNodes[i].shadowRoot?.querySelector('body');
                if (body) {
                    tmp.push(body); 
                }
            }
        }
        return tmp;
    }


    function depthSearch(element){
        //Identify divs that could be the cookieBanner. Build the CookieBanner list.
        let isCookieBanner;
        DisplayElementList("DEPTH SEARCH AT :", element.childNodes);
        element.childNodes.forEach(child => {
            //If no child matches, the current element is a good candidate.
            //else, we keep looking into the child element that looks good.
            isCookieBanner=true;
            if (NodeOrChildContainsKeyWord(CookieBannerKeyWords, child)
            && NodeOrChildContainsKeyWord(AcceptKeyWords, child)
            && NodeOrChildContainsKeyWord(DenyKeyWords, child)) {
                //If the condition is true, then the child is a good candidate.
                isCookieBanner=false;
                depthSearch(child);
            }
        });
        if (isCookieBanner) {
            if (!roots.includes(element)) { cookieBanners.push(element); }
        }
    }


    function isButton(element) {
        //return true if the element could be a button.
        if (element.textContent!=null 
        && element.textContent.length<BUTTON_TEXT_MAX_LENGTH) {
            return true;
        }
    }


    function isElementOnTop(element) {
        //return true if the element is on top (not hidden by another element).
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const elementAtPoint = document.elementFromPoint(centerX, centerY);
        return element === elementAtPoint || element.contains(elementAtPoint);
    }


    Array.prototype.buildRoots = function() {
        // Method to initialize the roots list (this will be our starting point).
        this.push(document.querySelector('body')); //ad body to our start points (roots list).
        SearchForShadowDOM().forEach(body => this.push(body)); //ad body of shadowDOMs to our start points (roots list).
        DisplayElementList("ROOT : ", this);
    }
    

    Array.prototype.searchForCookieBanners = function() {
        // Method to search for cookieBanners into a list of roots.
        this.forEach(root => depthSearch(root) );
        DisplayElementList("COOKIE BANNER : ", cookieBanners);
    }


    Array.prototype.getAllButtons = function() {
        // Method to get every element from a list of cookieBanner.
        tmp=[];
        this.forEach(cookieBanner => {
            cookieBanner.querySelectorAll('button, span, div').forEach(element => tmp.push(element) ); 
        });
        tmp=tmp.filter(isButton).unique();
        DisplayElementList("BUTTON : ", tmp);
        return tmp;
    }


    Array.prototype.getAcceptButtons = function() {
        // Method to get Accept buttons from a list of buttons.
        function FilterAcceptButtons(button) {
            if (NodeContainsKeyWord(AcceptKeyWords, button) && button.checkVisibility()
            && !(NodeContainsKeyWord(WrongAcceptKeyWords, button)) ) {
                return true;
            }
        }
        let tmp=this.filter(FilterAcceptButtons);
        if (tmp.length>1) tmp = tmp.filter(isElementOnTop);
        DisplayElementList("ACCEPT BUTTON : ", tmp);
        return tmp;
    }


    Array.prototype.getDenyButtons = function() {
        // Method to get Deny buttons from a list of buttons.
        function FilterDenyButtons(button) {
            if ((NodeContainsKeyWord(DenyKeyWords, button)) && button.checkVisibility() ) {
                return true;
            }
        }
        let tmp=this.filter(FilterDenyButtons);
        if (tmp.length>1) tmp = tmp.filter(isElementOnTop);
        DisplayElementList("DENY BUTTONS : ", tmp);
        return tmp;
    }


    Array.prototype.getCustomiseButtons = function() {
        // Method to get Customise buttons from a list of buttons.
        function FilterCustomiseButtons(button) {
            if ((NodeContainsKeyWord(CustomiseKeyWords, button)) && button.checkVisibility() ) {
                return true;
            }
        }
        let tmp=this.filter(FilterCustomiseButtons);
        if (tmp.length>1) tmp = tmp.filter(isElementOnTop);
        DisplayElementList("CUSTOMISE BUTTONS : ", tmp);
        return tmp;
    }


// ###############################################################################################
// ###############################################################################################


    roots.buildRoots(); //set our start point with all the roots we can find.
    roots.searchForCookieBanners(); //search for cookieBanners from roots.
    buttons = cookieBanners.getAllButtons(); //get everything thar could be a button in the cookieBanners.

    //select elements that could be the accept button
    acceptButtons = buttons.getAcceptButtons();

    //select elements that could be the deny button.
    denyButtons = buttons.getDenyButtons();

    //select elements that could be the customise button.
    customiseButtons = buttons.getCustomiseButtons();

    DisplayResult();
}