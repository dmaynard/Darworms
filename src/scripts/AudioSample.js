/**
 * Created by dmaynard on 1/19/15.
 */

function AudioSample(name, location) {
    this.location = location;
    this.name = name;
    this.incomingbuffer = undefined;
    this.savedBuffer = undefined;
    var xhr = new XMLHttpRequest();
    xhr.open('get',location, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = (function () {
        darworms.audioContext.decodeAudioData(xhr.response,
            (function(incomingBuffer) {
                // console.log( "on Load incoming Buffer");
                // console.log(" xhr " + xhr.status + "  " + xhr.statusText);
                // console.log(" incoming buffer = " + incomingBuffer );
                // console.log ( " this.name " + this.name);
                this.savedBuffer = incomingBuffer; // Save the buffer, we'll reuse it
            }
        ).bind(this));
    }).bind(this);
    xhr.send();
    darworms.audioSamples.push(this);
}

AudioSample.prototype.playSample = function (rate, pan) {
    var source;
    // console.log(" playSample " + this.name + "  " + this.location + "  savedBuffer " + this.savedBuffer);
    if (darworms.audioContext !== undefined && this.savedBuffer !== undefined) {
        // Do we have to create a new buffer every time we play a note ?
        source = darworms.audioContext.createBufferSource();
        source.buffer = this.savedBuffer;
        darworms.masterGainNode.gain.value = darworms.masterAudioVolume;
        source.connect(darworms.masterGainNode);
        // console.log(" playSample " + this.name + " volume  " + darworms.masterGainNode.gain.value);
        if ( darworms.audioPanner !== undefined ) {
          darworms.masterGainNode.connect(darworms.audioPanner);
          darworms.audioPanner.connect(darworms.audioContext.destination);
        }
        else {
          darworms.masterGainNode.connect(darworms.audioContext.destination);
        }

        if ( darworms.audioPanner !== undefined ) {
          darworms.audioPanner.pan.value = (pan * 0.80) ;  // jump cut is too harsh
        }
        source.start(0); // Play sound immediately. Renamed source.start from source.noteOn
        if (rate ) {
          source.playbackRate.value = rate;
        }

    }
};
