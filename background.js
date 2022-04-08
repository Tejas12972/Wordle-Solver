const contextMenus = {}

contextMenus.wordleAnser = 
    chrome.contextMenus.create(
        {
        "title":"Wordle Answer",
        "contexts" : ["editable"]
        },
        function (){
            if(chrome.runtime.lastError){
                console.error(chrome.runtime.lastError.message);
            }
        }
    );

chrome.contextMenus.onClicked.addListener(contextMenuHandler);

function contextMenuHandler(info, tab){
    if(info.menuItemId===contextMenus.wordleAnser){
        chrome.tabs.executeScript({
            file: './util/solver.js'
          });
    }
}