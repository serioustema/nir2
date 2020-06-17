class background {
    static updateBadge(tabId, text) {
        chrome.browserAction.setBadgeText({text: `${text}`, tabId: tabId})
    }
    static get AUDIO_STATE_AUDIO_CONTEXT(){
        return 'audioContext'
    }
    static get AUDIO_STATE_GAIN_NODE(){
        return 'gainNode';
    }

}




(function () {
    const audioStates = {};
    window.audioStates = audioStates;
    const connectTab = (tabId, stream) => {
        const e = new window.AudioContext;
        const f = e.createMediaStreamSource(stream);
        const g = e.createGain();
        f.connect(g);
        g.connect(e.destination);

        audioStates[tabId] = {
            [background.AUDIO_STATE_AUDIO_CONTEXT]: e,
            [background.AUDIO_STATE_GAIN_NODE]: g
        }
    };

    const updateVolume = (tabId, value) => {
        audioStates[tabId].gainNode.gain.value = value / 100
    };


    const init = (message, response) => {
        if(message.action === "getSettings"){
            response({});
        }
        if (message.action === 'popup-get-gain-value') {
            let value = null;
            if (Object.prototype.hasOwnProperty.call(audioStates, message.tabId)) {
                value = audioStates[message.tabId].gainNode.gain.value
            }
            response({gainValue: value})
        }

        if (message.action === 'popup-volume-change') {
            if (Object.prototype.hasOwnProperty.call(audioStates, message.tabId)) {
                updateVolume(message.tabId, message.sliderValue);
                background.updateBadge(message.tabId, message.sliderValue)
            } else {
                chrome.tabCapture.capture({
                    audio: true,
                    video: false
                }, (stream) => {
                    if (chrome.runtime.lastError) {
                        console.log(chrome.runtime.lastError);
                    } else {
                        connectTab(message.tabId, stream);
                        updateVolume(message.tabId, message.sliderValue);
                        background.updateBadge(message.tabId, message.sliderValue)
                    }
                });
            }
        }
    };
    chrome.tabs.onRemoved.addListener((tabId) => {
        Object.prototype.hasOwnProperty.call(audioStates, tabId) && audioStates[tabId].audioContext.close().then(() => {
            delete audioStates[tabId]
        })
    });
    chrome.runtime.onMessage.addListener((message, sender, response) => {
        init(message, response)
    });

  


})();