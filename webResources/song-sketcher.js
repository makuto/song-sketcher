function getUploadUrl() {
	/* return "http://" + window.location.host + "/upload"; */
	return "upload";
}

// from https://air.ghost.io/recording-to-an-audio-file-using-html5-and-js/

// appends an audio element to playback and download recording
function createAudioElement(blobUrl) {
    const downloadEl = document.createElement('a');
    downloadEl.style = 'display: block';
    downloadEl.innerHTML = 'download';
    downloadEl.download = 'audio.webm';
    downloadEl.href = blobUrl;
    const audioEl = document.createElement('audio');
    audioEl.controls = true;
    const sourceEl = document.createElement('source');
    sourceEl.src = blobUrl;
    sourceEl.type = 'audio/webm';
    audioEl.appendChild(sourceEl);
    document.body.appendChild(audioEl);
    document.body.appendChild(downloadEl);
}

var activeRecorder = null;

function startRecording() {
    // request permission to access audio stream
    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(stream => {
        // store streaming data chunks in array
        const chunks = [];
        // create media recorder instance to initialize recording
        const recorder = new MediaRecorder(stream);
        // function to be called when data is received
        recorder.ondataavailable = e => {
            // add stream data to chunks
            chunks.push(e.data);
            // if recorder is 'inactive' then recording has finished
            if (recorder.state == 'inactive') {
                // convert stream data chunks to a 'webm' audio format as a blob
				// TODO: This doesn't actually seem to convert to webm; when sent to the server it's ogg
                const blob = new Blob(chunks, {
                    type: 'audio/webm'
                });
                // convert blob to URL so it can be assigned to a audio src attribute
                createAudioElement(URL.createObjectURL(blob));

				// Upload to server
				var formData = new FormData();
				formData.append("recording", blob);
				formData.append("_xsrf", document.getElementsByName("_xsrf")[0].value);
				var uploadRequest = new XMLHttpRequest();
				// TODO: HTTPS
				uploadRequest.open('POST', getUploadUrl(), true);
				/* var contentType = "multipart/form-data; boundary=" + boundary; */
				/* var contentType = "multipart/form-data"; */
				/* uploadRequest.setRequestHeader("Content-Type", contentType); */
				uploadRequest.send(formData);
            }
        };
        // start recording with 1 second time between receiving 'ondataavailable' events
        recorder.start(1000);
        activeRecorder = recorder;
        // setTimeout to stop recording after 4 seconds
        /* setTimeout(() => {
           // this will trigger one final 'ondataavailable' event and set recorder state to 'inactive'
           recorder.stop();
           }, 4000); */
    }).catch(console.error);
}

function stopRecording() {
    if (activeRecorder) {
        activeRecorder.stop();
        activeRecorder = null;
    }
}

function getElement(id) {
    return document.getElementById(id);
}

function toggleRecord() {
    if (activeRecorder) {
        stopRecording();
        getElement("toggleRecord").innerHTML = "Record";
    } else {
        startRecording();
        getElement("toggleRecord").innerHTML = "Stop Recording";
    }
}
