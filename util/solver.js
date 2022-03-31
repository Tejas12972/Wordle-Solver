function solve() {
    var answer = new wordle.bundle.GameApp().solution
    window.alert(answer)
}

chrome.runtime.sendMessage({
    possible: solve(), 
});