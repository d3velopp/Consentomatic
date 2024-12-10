//Project Consentomatique
//STI INSA Centre-Val de Loire, 2024-2025.
//Titouan GODARD, Léopold MOSSER, Julian HOURNON, Léandro DOS SANTOS.

//consentomatique.js

async function start_consentomatique(tabID, role, delay) {
    //async funtion to start executing the main consentomatique function into the targeted tab.
    return new Promise(async function(res,err) {
        setTimeout(function() { //execute the following function with a delay
                chrome.scripting.executeScript({
                    target: {tabId: tabID, allFrames: true}, //in all iframes of the tab
                    func : consentomatique,
                    args : [role] //given a specified role (ACCEPT or DENY)
                }).then((result) => res(result)); //transmitting the result of main() as the result of this Promise
        }, delay);
    });
}

function consentomatique(role) {
    //main function of the Consentomatic, that we inject on the tab.
    //Gets the buttons, analyse the Style and click the buttons following the given role.

    function getAllButtons() {
        //Function that identify the buttons of the cookie banner.
        //returns [acceptButtons, denyButtons, customiseButtons] with idealy ONE button in each array.
    
        //Allow facultative prompts ?
        const DISPLAY = false;
        //Keyword Lists
        //FR 
        const AcceptKeyWordsFR = ['autoriser','continuer','accord','comprend', 'accepte']; //identify accept button.
        const WrongAcceptKeyWordsFR = ['?', 'sans', 'désactiver', 'seulement', 'uniquement']; //keywords that might trick our program.
        const DenyKeyWordsFR = ['refuser', 'refuse', 'sans accepter', 'rejeter', 'interdire', 'nécessaire', 'seulement']; //identify reject button.
        const SubscribeToDenyKeyWordsFR = ['abonner', 'payer'];
        const CustomiseKeyWordsFR = ['options', 'gérer', 'configure', 'paramétrer', 'paramètre', 'choisi', 'personnaliser', 'réglages', 'préférences']; //identify customise button.
        //EN
        const AcceptKeyWordsEN = ['accept','allow','consent','confirm','continue','agree', 'activate']; //identify accept button.
        const WrongAcceptKeyWordsEN = ['acceptable', 'choose', '?', 'without', 'if', 'deactivate', 'disagree', 'not']; //keywords that might trick our program.
        const DenyKeyWordsEN = ['refuse', 'deny', 'deactivate', 'without', 'reject', 'decline', 'necessary', 'only']; //identify reject button.
        const SubscribeToDenyKeyWordsEN = [];
        const CustomiseKeyWordsEN = ['custom', 'choose', 'options', 'set', 'manage', 'configure', 'settings']; //identify customise button.
        //SELECTED LANG
        let AcceptKeyWords = [];
        let WrongAcceptKeyWords = [];
        let DenyKeyWords = [];
        let SubscribeToDenyKeyWords = [];
        let CustomiseKeyWords = [];
        const CookieBannerKeyWords = ['cookie', 'privacy', 'personal data', 'gdpr', 'rgpd']; //identify the cookie banner.
        //Constants
        BUTTON_TEXT_MAX_LENGTH = 70;
    
        // ###############################################################################################
        // ###############################################################################################
    
        function selectLangFR(){
            AcceptKeyWords = AcceptKeyWordsFR;
            WrongAcceptKeyWords = WrongAcceptKeyWordsFR;
            DenyKeyWords = DenyKeyWordsFR;
            SubscribeToDenyKeyWords = SubscribeToDenyKeyWordsFR;
            CustomiseKeyWords = CustomiseKeyWordsFR;
        }
    
        function selectLangEN(){
            AcceptKeyWords = AcceptKeyWordsEN;
            WrongAcceptKeyWords = WrongAcceptKeyWordsEN;
            DenyKeyWords = DenyKeyWordsEN;
            SubscribeToDenyKeyWords = SubscribeToDenyKeyWordsEN;
            CustomiseKeyWords = CustomiseKeyWordsEN;
        }
    
        function selectLangUnknown(){
            AcceptKeyWords = AcceptKeyWordsEN.concat(AcceptKeyWordsFR);
            WrongAcceptKeyWords = WrongAcceptKeyWordsEN.concat(WrongAcceptKeyWordsFR);
            DenyKeyWords = DenyKeyWordsEN.concat(DenyKeyWordsFR);
            SubscribeToDenyKeyWords = SubscribeToDenyKeyWordsEN.concat(SubscribeToDenyKeyWordsFR);
            CustomiseKeyWords = CustomiseKeyWordsEN.concat(CustomiseKeyWordsFR);
        }
    
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
            if (DISPLAY) {
                console.log(text, list);
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
    
        function searchforCookieBanners(element){
            //Identify divs that could be the cookieBanner. Build the CookieBanner list.
            let isCookieBanner;
            element.childNodes.forEach(child => {
                //If no child matches, the current element is a good candidate.
                //else, we keep looking into the child element that looks good.
                isCookieBanner=true;
                if (child.containsKeyWord(CookieBannerKeyWords) && child.containsKeyWord(AcceptKeyWords)) {
                    //The child is a good candidate.
                    isCookieBanner=false;
                    searchforCookieBanners(child);
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
    
        Array.prototype.getAllButtons = function() {
            // Method to get every element from a list of cookieBanner.
            tmp=[];
            this.forEach(cookieBanner => {
                cookieBanner.querySelectorAll('button, span, div, a').forEach(element => tmp.push(element) ); 
            });
            tmp=tmp.filter(isButton).unique();
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




        Array.prototype.clickButtons = function() {
            //Method to click each buttons of the array.
            var buttonText = [];
            this.forEach(button => {
                button.click();
                console.log("BUTTON CLICKED : ", button.textContent, button);
                buttonText.push(button.textContent);
                //if (button.checkVisibility()) { //if the button is still visible, then it was not clicked. Lets try to click on it's position.
                if (true) {   
                    const rect = button.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    document.elementFromPoint(centerX, centerY).click();
                    //console.log("Button clicked on position X Y : ", button.textContent);
                }
            });
            return buttonText;
        }


    
        // ###############################################################################################
        // ###############################################################################################
    
        //Variables
        let roots = [];
        let cookieBanners = [];
        let buttons = [];
    
        //Lang
        if (document.documentElement.lang.includes('en')){
            //lang => EN
            selectLangEN();
        } else if (document.documentElement.lang.includes('fr')){
            //lang => FR
            selectLangFR();
        }
        else {
            //lang => Unknown
            selectLangUnknown();
        }
    
        //Build roots list
        roots.push(document.querySelector('body')); //ad body of main document to our start points (roots list).
        searchForShadowDOM().forEach(body => roots.push(body)); //ad body of shadowDOMs to our start points (roots list).
    
        //Build cookieBanners List
        roots.forEach(root => searchforCookieBanners(root) );
    
        //Build buttons list
        buttons = cookieBanners.getAllButtons();
    
        //If the result is wrong, then our cookieBanner is probably wrong (maybe too precise), so we select the parent banner.
        if (buttons.getAcceptButtons().length==0 && buttons.getDenyButtons().length==0){
            cookieBanners.forEach(element=>cookieBanners.push(element.parentElement));
            buttons = cookieBanners.getAllButtons();
        }
    
        return [buttons.getAcceptButtons(), buttons.getDenyButtons(), buttons.getCustomiseButtons()];
    }
    
    

    //function CSSAnalyse(){}

    //function evaluate(){}

    //Execution of the function :
    var status = ["FAILURE"];
    var clickedButtonText;
    var [acceptButtons, denyButtons, customiseButtons] = getAllButtons();
    
    //Call AnalyseCSS here.

    //click buttons according to the role.
    if (role=="ACCEPT") {
        if(acceptButtons.length>0) {
            clickedButtonText=acceptButtons.clickButtons();
            status = "SUCCESS";
        }
    }
    else if (role=="DENY") {
        if(denyButtons.length>0) {
            clickedButtonText=denyButtons.clickButtons();
            status = "SUCCESS";
        }
    }
    return status;
}