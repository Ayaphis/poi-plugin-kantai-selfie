import React, { Component } from 'react'
import { Button, Panel } from 'react-bootstrap'
import FileWriter from 'views/utils/file-writer' // import poi's writer
const { APPDATA_PATH } = window
import { Listener } from './listener'
let listener


export const reactClass = class CapturerUI extends Component {
    render() {
        return (
            <div id="selfie-main" className="selfie-main-div">
                <Panel collapsible header="Testing" id="selfie-test">
                    <Button onClick={handleCapture}>Trigger A Capture</Button>
                    <Button onClick={handleFleetAnalyse}>Generate hopelist</Button>
                </Panel>
            </div>
        )
    }
}

export const
    pluginDidLoad = (e) => {
        listener = new Listener(handleCapture)
        listener.start()
    },
    pluginWillUnload = (e) => {
        listener.stop()
    };

// poi\views\components\info\control.es handleCapturePage
import path from 'path-extra'
function handleCapture(ship_id) {
    const bound = $('kan-game webview').getBoundingClientRect()
    const rect = {
        x: Math.ceil(bound.left),
        y: Math.ceil(bound.top),
        width: Math.floor(bound.width),
        height: Math.floor(bound.height),
    }
    const d = process.platform == 'darwin' ? path.join(remote.app.getPath('home'), 'Pictures', 'Poi') : path.join(APPDATA_PATH, 'screenshots')
    const screenshotPath = config.get('poi.screenshotPath', d)
    const usePNG = config.get('poi.screenshotFormat', 'png') === 'png'
    const shipname = !isNaN(ship_id) ? $ships[ship_id].api_name : "test"
    remote.getGlobal("mainWindow").capturePage(rect, (image) => {
        try {
            const buf = usePNG ? image.toPNG() : image.toJPEG(80)
            const now = new Date()
            const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}T${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}`
            //fs.ensureDirSync(screenshotPath)
            const filename = path.join(screenshotPath, `${date}_${shipname}.${usePNG ? 'png' : 'jpg'}`)
            const fw = new FileWriter()
            fw.write(filename, buf, function (err) {
                if (err) {
                    throw err
                }
                //window.success(`${('screenshot saved to')} ${filename}`)
            })
        } catch (error) {
            console.log(error)
            //window.error(('Failed to save the screenshot'))
        }
    })
}


function handleFleetAnalyse(){
    const temps = {}
    for (const index in $ships) {
        const ship = $ships[index]

        if (ship.api_getmes !== undefined) {
            temps[index] = { after: ship.api_aftershipid, fresh: true }
        }
    }
    //console.log(temps)
    for (const index in temps) {
        const ship = temps[index]
        if (ship.after !== "0") {
            temps[ship.after].fresh = false
        }
    }
    const freshes = []
    for (const index in temps) {
        if (temps[index].fresh) {
            freshes.push(index)
        }
    }
    //console.log(freshes)

    const protoship = {}
    for (const index of freshes) {
        const family = []
        protoship[index] = index
        for (let after = $ships[index].api_aftershipid; after !== "0" && family.indexOf(after) === -1; after = $ships[after].api_aftershipid) {
            family.push(after)
            protoship[after] = index
        }
    }

    //console.log(protoship)

    const unmet = {}
    for (const index of freshes) {
        unmet[index] = true
    }
    for (const index in _ships) {
        const proto = protoship[_ships[index].api_ship_id]
        unmet[proto] = false
    }
    const unmetShips = []
    for (const index in unmet) {
        if (unmet[index])
            unmetShips.push(index)
    }
    console.log(unmetShips.map(x => $ships[x].api_name))
    listener.hopelist = unmetShips
}