    let answ = runScript();
    document.getElementById("answer_xfg").innerText = answ

    function runScript() {
        chrome.tabs.executeScript({
            file: './solver.js'
        })
    }