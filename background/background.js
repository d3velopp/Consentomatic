
chrome.runtime.onInstalled.addListener(() => { 
    console.log("Extension installée !");
});

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if(msg.type === 'CONSENTOMATIC:Execute') {
        console.log("Execute Consentomatic");
        chrome.storage.local.get(["Consentomatic_ROLE"]).then((result) => {
            // Get the current tab.
            chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
                if (tabs.length > 0) {
                    const activeTab = tabs[0].id;
                    console.log(tabs.length);
                    // Exécution du script
                    chrome.scripting.executeScript({
                        target: {tabId: activeTab, allFrames: true},
                        func : main,
                        args : [result.Consentomatic_ROLE]
                    });
                }
            });
        });
    }
});

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if(msg.type === 'CONSENTOMATIC:GetPopupStatus') {
        console.log("CONSENTOMATIC:GetPopupStatus");
        chrome.storage.local.get(["Consentomatic_ROLE"]).then((result) => {
            if (result.Consentomatic_ROLE=="ACCEPT"){
                chrome.runtime.sendMessage({type:'CONSENTOMATIC:SetPopupStatus=ACCEPT'});
            }
            else if (result.Consentomatic_ROLE=="DENY"){
                chrome.runtime.sendMessage({type:'CONSENTOMATIC:SetPopupStatus=DENY'});
            }
        });
    }
});

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if(msg.type === 'CONSENTOMATIC:SetROLE=ACCEPT') {
        console.log("CONSENTOMATIC:SetROLE=ACCEPT");
        setRole("ACCEPT");
    }
});

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if(msg.type === 'CONSENTOMATIC:SetROLE=DENY') {
        console.log("CONSENTOMATIC:SetROLE=DENY");
        setRole("DENY");
    }
});

function setRole(role) {
    chrome.storage.local.set({ Consentomatic_ROLE: role });
}

function main(role){
    function getAllButtons() {
        //Function that identify the buttons of the cookie banner.
        //returns [acceptButtons, denyButtons, customiseButtons] with idealy ONE button in each array.

        //Allow facultative prompts ?
        const DISPLAY = false;
        //Keyword Lists
        const AcceptKeyWords = ['accept','allow','consent','confirm','continue','agree', 'activate','autoriser','continuer','accord','comprend']; //identify accept button.
        const WrongAcceptKeyWords = ['acceptable', 'choose', '?', 'sans', 'without', 'if', 'deactivate', 'disagree', 'not', "d'ont"]; //keywords that might trick our program.
        const DenyKeyWords = ['refuser', 'refuse', 'sans accepter', 'deny', 'deactivate', 'without', 'reject', 'decline', 'rejeter', 'interdire', 'necessary', 'nécessaire', 'only', 'seulement']; //identify reject button.
        const SubscribeToDenyKeyWords = ['abonner', 'payer'];
        const CustomiseKeyWords = ['custom', 'choose', 'options', 'set', 'manage', 'gérer', 'configure', 'paramétrer', 'paramètre', 'choisi', 'personnaliser', 'réglages']; //identify customise button.
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

        // ###############################################################################################
        // ###############################################################################################

        Array.prototype.unique = function() {
            // Method to remove duplicates in an array.
            return Array.from(new Set(this));
        }

        HTMLElement.prototype.directText = function () {
            // Return textContent of current node WITHOUT TEXT OF CHILDREN.
            let el=this.cloneNode(true);
            while (el.children[0]) el.children[0].remove();
            return el.textContent;
        }

        function displayElementList(text, list) {
            //display all elements from a list, with a descriptive text.
            if (DISPLAY && list.length>0) {
                list.forEach(element => console.log(text, element));
            }
        }

        Node.prototype.containsKeyWord = function (keyword_list) {
            //Boolean function that test if a keyword from a list is included in the textContent of an element, including content of children nodes.
            let result = false;
            keyword_list.forEach(keyword => {  
                if (this.innerText!=null){
                    if (this.innerText.toLowerCase().includes(keyword)) { 
                        result = true; 
                    }
                }
            });
            return result;
        }

        Node.prototype.containsKeyWord_noChildrens = function (keyword_list) {
            //Boolean function that test if a keyword from a list is included in the textContent of an element, NOT including content of children nodes.
            let result = false;
            elementText=this.directText();
            keyword_list.forEach(keyword => {  
                if (elementText!=null){
                    if (elementText.toLowerCase().includes(keyword)) { 
                        result = true; 
                    }
                }
            });
            return result;
        }

        function searchForShadowDOM() {
            //looking for a shadowDOM
            let tmp=[];
            allNodes = document.getElementsByTagName('*');
            for (i = 0; i < allNodes.length; i++) {
                if(allNodes[i].shadowRoot) {
                    let body = allNodes[i].shadowRoot?.querySelector('body');
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
            element.childNodes.forEach(child => {
                //If no child matches, the current element is a good candidate.
                //else, we keep looking into the child element that looks good.
                isCookieBanner=true;
                if (child.containsKeyWord(CookieBannerKeyWords) && child.containsKeyWord(AcceptKeyWords)) {
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
            && element.textContent.length<BUTTON_TEXT_MAX_LENGTH
            && element.checkVisibility()) {
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

        function searchForCookieBanners(){
            // Function to build a list of roots and search for cookieBanners from the roots.
            roots=[];
            roots.push(document.querySelector('body')); //ad body to our start points (roots list).
            searchForShadowDOM().forEach(body => roots.push(body)); //ad body of shadowDOMs to our start points (roots list).
            //SearchForIframes().forEach(body => roots.push(body)); //ad body of iframes to our start points (roots list).
            displayElementList("ROOT : ", this);
            roots.forEach(root => depthSearch(root) );
            displayElementList("COOKIE BANNER : ", cookieBanners);
        }

        Array.prototype.getAllButtons = function() {
            // Method to get every element from a list of cookieBanner.
            tmp=[];
            this.forEach(cookieBanner => {
                cookieBanner.querySelectorAll('button, span, div, a').forEach(element => tmp.push(element) ); 
            });
            tmp=tmp.filter(isButton).unique();
            displayElementList("BUTTON : ", tmp);
            return tmp;
        }

        Array.prototype.getAcceptButtons = function() {
            // Method to get Accept buttons from a list of buttons.
            function filterAcceptButtons(button) {
                if (button.containsKeyWord_noChildrens(AcceptKeyWords)
                && !(button.containsKeyWord_noChildrens(WrongAcceptKeyWords)) ) {
                    return true;
                }
            }
            let tmp=this.filter(filterAcceptButtons);
            if (tmp.length>1) tmp = tmp.filter(isElementOnTop);
            displayElementList("ACCEPT BUTTON : ", tmp);
            return tmp;
        }

        Array.prototype.getDenyButtons = function() {
            // Method to get Deny buttons from a list of buttons.
            function filterDenyButtons(button) {
                if ((button.containsKeyWord_noChildrens(DenyKeyWords)) ) {
                    return true;
                }
            }
            let tmp=this.filter(filterDenyButtons);
            if (tmp.length>1) tmp = tmp.filter(isElementOnTop);
            displayElementList("DENY BUTTONS : ", tmp);
            return tmp;
        }

        Array.prototype.getCustomiseButtons = function() {
            // Method to get Customise buttons from a list of buttons.
            function filterCustomiseButtons(button) {
                if ((button.containsKeyWord_noChildrens(CustomiseKeyWords)) ) {
                    return true;
                }
            }
            let tmp=this.filter(filterCustomiseButtons);
            if (tmp.length>1) tmp = tmp.filter(isElementOnTop);
            displayElementList("CUSTOMISE BUTTONS : ", tmp);
            return tmp;
        }

        // ###############################################################################################
        // ###############################################################################################

        searchForCookieBanners();
        buttons = cookieBanners.getAllButtons(); //get everything thar could be a button in the cookieBanners
        return [buttons.getAcceptButtons(), buttons.getDenyButtons(), buttons.getCustomiseButtons()];
    }

    Array.prototype.clickButtons = function() {
        //Method to click each buttons of the array.
        let clickDone = false;
        this.forEach(button => {
            button.click();
            console.log("BUTTON CLICKED : ", button.textContent);
            if (button.checkVisibility()) { //if the button is still visible, then it was not clicked. Lets try to click on it's position.
                const rect = button.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                document.elementFromPoint(centerX, centerY).click();
                console.log("Button clicked on position X Y : ", button.textContent);
            }
            clickDone = true;
        });
        return clickDone;
    }

    //function AnalyseCSS()

    //Execution of the function : 
    var [acceptButtons, denyButtons, customiseButtons] = getAllButtons();
    //Call AnalyseCSS here.
    if (role=="ACCEPT"){ //click Accept Button
        if(acceptButtons.length>0){
            acceptButtons.clickButtons();
        }
    }
    if (role=="DENY"){ //Click Deny button
        if(acceptButtons.length>0){
            denyButtons.clickButtons();
        }
    }
}

