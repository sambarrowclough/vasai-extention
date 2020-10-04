chrome.commands.onCommand.addListener(function(command) {
    chrome.storage.sync.get('isRecording', function(obj) {
        isRecording = obj.isRecording === 'true';

        // auto-stop-recording
        if (isRecording === true) {
            chrome.storage.sync.set({
                isRecording: 'false'
            }, function() {
                stopScreenRecording();    
            });
        } else {
            isRecording=true
            chrome.storage.sync.set({
                isRecording: 'true'
            }, function() {
                getUserConfigs();
            });
        }
    });

});