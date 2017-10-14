function getVoice(ship_id) {
    return (ship_id + 7) * 17 * (2475) % 99173 + 100000
}

export class Listener {
    toget = 0
    trigger = ""
    hopelist = []
    constructor(callback) {
        if (typeof callback === "function") {
            this.callback = callback
        }
    }
    handleGet = (e) => {
        if (this.toget) {
            // when new ship in hopelist
            const match = /kcs\/sound\/(.*?)\/(.*?).mp3/.exec(e.newURL)
            if (match && match.length === 3) {
                const [, , filename] = match
                if (this.trigger === filename) {
                    // check if voice file is new ship's get voice
                    // console.log("trigger!")
                    this.callback(this.toget)
                    this.hopelist = this.hopelist.filter(x=>x!=this.toget)
                    this.toget = 0
                }
            }
        }
    }
    handleResponse = (e) => {
        const { body, path } = e.detail
        if (path === "/kcsapi/api_req_sortie/battleresult") {
            if (body.api_get_ship !== undefined
                && this.hopelist.indexOf(body.api_get_ship.api_ship_id) !== -1) {
                this.toget = body.api_get_ship.api_ship_id
                this.trigger = "" + getVoice(this.toget)
                //console.log(this.toget, this.trigger)
            }
        } else if (path === "/kcsapi/api_req_kousyou/getship") {
            if (this.hopelist.indexOf(body.api_ship_id) !== -1) {
                this.toget = body.api_ship_id
                this.trigger = "" + getVoice(this.toget)
                //console.log(this.toget, this.trigger)
            }
        }
    }
    start() {
        $('kan-game webview').addEventListener('did-get-response-details'
            , this.handleGet)
        window.addEventListener('game.response', this.handleResponse)
    }
    stop() {
        $('kan-game webview').removeEventListener('did-get-response-details'
            , this.handleGet)
        window.removeEventListener('game.response', this.handleResponse)
    }
}

