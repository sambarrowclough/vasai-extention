chrome.storage.sync.set({
    isRecording: 'false' // FALSE
});

chrome.browserAction.setIcon({
    path: 'images/logo.png'
});

function gotStream(stream) {
    var options = {
        type: 'video',
        disableLogs: false
    };

    if (!videoCodec) {
        videoCodec = 'Default'; // prefer VP9 by default
    }

    if (videoCodec) {
        if (videoCodec === 'Default') {
            options.mimeType = 'video/webm\;codecs=vp9';
        }

        if (videoCodec === 'VP8') {
            options.mimeType = 'video/webm\;codecs=vp8';
        }

        if (videoCodec === 'VP9') {
            options.mimeType = 'video/webm\;codecs=vp9';
        }

        if (videoCodec === 'H264') {
            if (isMimeTypeSupported('video/webm\;codecs=h264')) {
                options.mimeType = 'video/webm\;codecs=h264';
            }
        }

        if (videoCodec === 'MKV') {
            if (isMimeTypeSupported('video/x-matroska;codecs=avc1')) {
                options.mimeType = 'video/x-matroska;codecs=avc1';
            }
        }

        if(enableTabCaptureAPIAudioOnly || (enableMicrophone && !enableCamera && !enableScreen) || (enableSpeakers && !enableScreen && !enableCamera)) {
            options.mimeType = 'audio/wav';
        }
    }

    if (bitsPerSecond) {
        bitsPerSecond = parseInt(bitsPerSecond);
        if (!bitsPerSecond || bitsPerSecond < 100) {
            bitsPerSecond = 8000000000; // 1 GB /second
        }
    }

    if (bitsPerSecond) {
        options.bitsPerSecond = bitsPerSecond;
    }

    if (cameraStream) {
        var ignoreSecondPart = false;
        
        if(enableSpeakers && enableMicrophone) {
            var mixAudioStream = getMixedAudioStream([cameraStream, stream]);
            if(mixAudioStream && getTracks(mixAudioStream, 'audio').length) {
                ignoreSecondPart = true;
                
                var mixedTrack = getTracks(mixAudioStream, 'audio')[0];
                stream.addTrack(mixedTrack);
                getTracks(stream, 'audio').forEach(function(track) {
                    if(track === mixedTrack) return;
                    stream.removeTrack(track);
                });
            }
        }

        if(!ignoreSecondPart) {
            getTracks(cameraStream, 'audio').forEach(function(track) {
                stream.addTrack(track);
                cameraStream.removeTrack(track);
            });
        }
    }

    // fix https://github.com/muaz-khan/RecordRTC/issues/281
    options.ignoreMutedMedia = false;

    if(options.mimeType === 'audio/wav') {
        options.numberOfAudioChannels = 2;
        recorder = new StereoAudioRecorder(stream, options);
        recorder.streams = [stream];
    }
    else if (enableScreen && cameraStream && getTracks(cameraStream, 'video').length) {
        // adjust video on top over screen

        // on faster systems (i.e. 4MB or higher RAM):
        // screen: 3840x2160 
        // camera: 1280x720
        stream.width = screen.width;
        stream.height = screen.height;
        stream.fullcanvas = true; // screen should be full-width (wider/full-screen)

        // camera positioning + width/height
        cameraStream.width = parseInt((20 / 100) * stream.width);
        cameraStream.height = parseInt((20 / 100) * stream.height);
        cameraStream.top = stream.height - cameraStream.height;
        cameraStream.left = stream.width - cameraStream.width;

        // frame-rates
        options.frameInterval = 1;

        recorder = new MultiStreamRecorder([cameraStream, stream], options);
        recorder.streams = [stream, cameraStream];
    } else {
        recorder = new MediaStreamRecorder(stream, options);
        recorder.streams = [stream];
    }

    recorder.record();

    isRecording = true;
    onRecording();

    addStreamStopListener(recorder.streams[0], function() {
        stopScreenRecording();
    });

    initialTime = Date.now()
    timer = setInterval(checkTime, 100);

    // tell website that recording is started
    startRecordingCallback();
}

function stopScreenRecording() {
    if(!recorder || !isRecording) return;

    if (timer) {
        clearTimeout(timer);
    }
    setBadgeText('');
    isRecording = false;

    chrome.browserAction.setTitle({
        title: 'Record Your Screen, Tab or Camera'
    });
    chrome.browserAction.setIcon({
        path: 'images/logo.png'
    });

    recorder.stop(function onStopRecording(blob, ignoreGetSeekableBlob) {
        if(fixVideoSeekingIssues && recorder && !ignoreGetSeekableBlob) {
            getSeekableBlob(recorder.blob, function(seekableBlob) {
                onStopRecording(seekableBlob, true);
            });
            return;
        }

        var mimeType = 'video/webm';
        var fileExtension = 'webm';

        if (videoCodec === 'H264') {
            if (isMimeTypeSupported('video/webm\;codecs=h264')) {
                mimeType = 'video/mp4';
                fileExtension = 'mp4';
            }
        }

        if (videoCodec === 'MKV') {
            if (isMimeTypeSupported('video/x-matroska;codecs=avc1')) {
                mimeType = 'video/mkv';
                fileExtension = 'mkv';
            }
        }

        if(enableTabCaptureAPIAudioOnly || (enableMicrophone && !enableCamera && !enableScreen) || (enableSpeakers && !enableScreen && !enableCamera)) {
            mimeType = 'audio/wav';
            fileExtension = 'wav';
        }

        var file = new File([recorder ? recorder.blob : ''], getFileName(fileExtension), {
            type: mimeType
        });

        if(ignoreGetSeekableBlob === true) {
            file = new File([blob], getFileName(fileExtension), {
                type: mimeType
            });
        }

        localStorage.setItem('selected-file', file.name);

        // initialTime = initialTime || Date.now();
        // var timeDifference = Date.now() - initialTime;
        // var formatted = convertTime(timeDifference);
        // file.duration = formatted;

        DiskStorage.StoreFile(file, function(response) {
            try {
                videoPlayers.forEach(function(player) {
                    player.srcObject = null;
                });
                videoPlayers = [];
            } catch (e) {}

            // -------------
            if (recorder && recorder.streams) {
                recorder.streams.forEach(function(stream, idx) {
                    stream.getTracks().forEach(function(track) {
                        track.stop();
                    });

                    if (idx == 0 && typeof stream.onended === 'function') {
                        stream.onended();
                    }
                });

                recorder.streams = null;
            }

            isRecording = false;
            setBadgeText('');
            chrome.browserAction.setIcon({
                path: 'images/logo.png'
            });
            // -------------

            stopRecordingCallback(file);

            chrome.storage.sync.set({
                isRecording: 'false'
            });


            openPreviewOnStopRecording && chrome.tabs.query({}, function(tabs) {
                chrome.storage.sync.get('detect', function({detect}){
                    var found = false;
                    var url = 'chrome-extension://' + chrome.runtime.id + '/preview.html';
                    for (var i = tabs.length - 1; i >= 0; i--) {
                        if (tabs[i].url === url) {
                            found = true;
                            chrome.tabs.update(tabs[i].id, {
                                active: true,
                                url: detect ? url += '?detect='+ detect : url
                            });
                            break;
                        }
                    }
                    if (!found) {
                        if (detect != null) {
                            chrome.tabs.create({
                                url: 'preview.html?detect=' + detect
                            });
                        } else {
                            chrome.tabs.create({
                                url: 'preview.html'
                            });
                        }
                    }
                })

                setDefaults();
            });
        });
    });
}

function setDefaults() {
    chrome.browserAction.setIcon({
        path: 'images/logo.png'
    });

    if (recorder && recorder.streams) {
        recorder.streams.forEach(function(stream) {
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
        });

        recorder.streams = null;
    }

    recorder = null;
    isRecording = false;
    imgIndex = 0;

    bitsPerSecond = 0;
    enableTabCaptureAPI = false;
    enableTabCaptureAPIAudioOnly = false;
    enableScreen = true;
    enableMicrophone = false;
    enableCamera = false;
    cameraStream = false;
    enableSpeakers = true;
    videoCodec = 'Default';
    videoMaxFrameRates = '';
    videoResolutions = '1920x1080';
    isRecordingVOD = false;
    fixVideoSeekingIssues = false;

    // for dropdown.js
    chrome.storage.sync.set({
        isRecording: 'false' // FALSE
    });
}

function getUserConfigs() {
    enableTabCaptureAPI=true
    return captureTabUsingTabCapture();
}

