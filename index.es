import React, { Component } from 'react'
import { Button, Panel } from 'react-bootstrap'
import FileWriter from 'views/utils/file-writer' // import poi's writer
const { APPDATA_PATH } = window

export const reactClass = class CapturerUI extends Component {
    render() {
        return (
            <div id="selfie-main" className="selfie-main-div">
                <Panel collapsible header="Testing" id="selfie-test">
                    <Button onClick={handleCapture}>Trigger A Capture</Button>
                </Panel>
            </div>
        )
    }
}

// poi\views\components\info\control.es handleCapturePage
import path from 'path-extra'
function handleCapture() {
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
    remote.getGlobal("mainWindow").capturePage(rect, (image) => {
        try {
            const buf = usePNG ? image.toPNG() : image.toJPEG(80)
            const now = new Date()
            const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}T${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}`
            //fs.ensureDirSync(screenshotPath)
            const filename = path.join(screenshotPath, `${date}.${usePNG ? 'png' : 'jpg'}`)
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