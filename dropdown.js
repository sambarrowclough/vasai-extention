var runtimePort = chrome.runtime.connect({
    name: location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|\+|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('')
});

runtimePort.onMessage.addListener(function(message) {
    if (!message || !message.messageFromContentScript1234) {
        return;
    }
});

var isRecording = false;
chrome.storage.sync.get('isRecording', function(obj) {
    isRecording = obj.isRecording === 'true';

    // auto-stop-recording
    if (isRecording === true) {
		chrome.storage.sync.set({
				isRecording: 'false'
		}, function() {
			runtimePort.postMessage({
					messageFromContentScript1234: true,
					stopRecording: true,
					dropdown: true
			});
			window.close();
		});
    }
});

document.getElementById('rec').onclick = function() {
    isRecording=true
    chrome.storage.sync.set({
        isRecording: 'true'
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startRecording: true,
            dropdown: true
        });
        window.close();
    });
}
