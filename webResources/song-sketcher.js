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
		// Multitracker should play other tracks during recording. This will cause feedback without
		// headphones but it's not meant to be a finished recording, just a "sketch"
		var audioTracks = document.getElementsByTagName("audio");
		for (var i = 0; i < audioTracks.length; i++)
		{
			// In case the user played individual tracks, reset their time
			audioTracks[i].currentTime = 0;
			audioTracks[i].play();
		}
		
        startRecording();
        getElement("toggleRecord").innerHTML = "Stop Recording";
    }
}

function togglePlay() {

	var audioTracks = document.getElementsByTagName("audio");
	
	var tracksArePlaying = false;
	for (var i = 0; i < audioTracks.length; i++)
	{
		if (!audioTracks[i].paused)
			tracksArePlaying = true;
	}
	
    if (tracksArePlaying) {
        for (var i = 0; i < audioTracks.length; i++)
		{
			audioTracks[i].pause();
			audioTracks[i].currentTime = 0;
		}
        getElement("togglePlay").innerHTML = "Play";
    } else {
        for (var i = 0; i < audioTracks.length; i++)
		{
			// In case the user played individual tracks, reset their time
			audioTracks[i].currentTime = 0;
			audioTracks[i].play();
		}
        getElement("togglePlay").innerHTML = "Stop";
    }
}
