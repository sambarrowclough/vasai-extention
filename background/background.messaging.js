var runtimePort;

chrome.runtime.onConnect.addListener(function(port) {
    runtimePort = port;

    runtimePort.onMessage.addListener(function(message) {
        if (!message || !message.messageFromContentScript1234) {
            return;
        }

        if (message.startRecording) {
            if(message.onlyMicrophone && enableCamera) {
                message.startRecording = false;
                message.stopRecording = true;
                alert('Unable to access camera device.');
                setDefaults();
                return;
            }
        }

        if (message.startRecording) {
            if(message.dropdown) {
                openPreviewOnStopRecording = true;
                openCameraPreviewDuringRecording = true;
            }

            if (isRecording && message.dropdown) {
                stopScreenRecording();
                return;
            }

            if(message.RecordRTC_Extension) {
                startRecordingCallback = function(file) {
                    port.postMessage({
                        messageFromContentScript1234: true,
                        startedRecording: true
                    });
                };

                chrome.storage.sync.set({
                    isRecording: 'true'
                }, function() {
                    getUserConfigs();
                });
                return;
            }

            getUserConfigs();
            return;
        }

        if (message.stopRecording) {
            if(message.RecordRTC_Extension) {
                stopRecordingCallback = function(file) {
                    var reader = new FileReader();
                    reader.onload = function(e) {

                        port.postMessage({
                            messageFromContentScript1234: true,
                            stoppedRecording: true,
                            file: e.target.result
                        });
                    };
                    reader.readAsDataURL(file);
                };
            }


            stopScreenRecording();
            return;
        }
    });
});
