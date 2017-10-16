import React, { Component } from 'react'
import { Button, Panel, Checkbox, Label } from 'react-bootstrap'
//import FontAwesome from 'react-fontawesome'
import FileWriter from 'views/utils/file-writer' // import poi's writer
const { APPDATA_PATH } = window
import { Listener } from './listener'
let listener
let hopeShips = fleetAnalyse()
let hopeCheck = true
let costalCheck = true
const Coastal_Defense_Ship = [517, 518, 524, 525]

export const reactClass = class CapturerUI extends Component {
    state = {
        costalCheck: costalCheck,
        hopeCheck: hopeCheck,
        hopelist: hopeShips,
    }
    // handleFleetAnalyse = () => {
    //     this.setState({ hopelist: fleetAnalyse() })
    // }
    costalCheckChange = () => {
        costalCheck = !this.state.costalCheck
        this.setState({ costalCheck: costalCheck })
        //console.log("costal:", costalCheck)
    }
    hopeCheckChange = () => {
        hopeCheck = !this.state.hopeCheck
        this.setState({ hopeCheck: hopeCheck })
        //console.log("hope:", hopeCheck)
    }
    componentDidMount = () => {
        window.addEventListener("selfie.cap", this.handleCap)
    }
    componentWillUnmount = () => {
        window.removeEventListener("selfie.cap", this.handleCap)
    }
    handleCap = () => {
        this.setState({ hopelist: hopeShips })
        console.log("cap! ", hopeShips)
    }

    render() {
        return (
            <div id="selfie-main" className="selfie-main-div">
                <Panel collapsible header="Testing" id="selfie-test">
                    <Button onClick={handleCapture}>Trigger A Capture</Button>
                    {//<Button onClick={this.handleFleetAnalyse}>Generate hopelist</Button>
                    }
                </Panel>
                <Panel collapsible header="Capture when ship in below appears" id="selfie-caplist">
                    <Checkbox checked={this.state.costalCheck} onChange={this.costalCheckChange} >Coastal Defense Ship</Checkbox>
                    <MiniList
                        open={this.state.costalCheck}
                        list={Coastal_Defense_Ship}
                    />
                    <Checkbox checked={this.state.hopeCheck} onChange={this.hopeCheckChange} >Hope List</Checkbox>
                    <MiniList
                        open={this.state.hopeCheck}
                        list={this.state.hopelist}
                    />
                </Panel>
            </div>
        )
    }
}

export const
    pluginDidLoad = (e) => {
        listener = new Listener(handleHope, inhope)
        listener.start()
    },
    pluginWillUnload = (e) => {
        listener.stop()
    };

// poi\views\components\info\control.es handleCapturePage
import path from 'path-extra'
function handleCapture(shipname) {
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

function handleHope(ship_id) {
    hopeShips = hopeShips.filter(x => x !== ship_id)
    const shipname = !isNaN(ship_id) ? $ships[ship_id].api_name : "test"
    handleCapture(shipname)
    dispatchEvent(new Event("selfie.cap"))
}


function fleetAnalyse() {
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
    //console.log(unmetShips.map(x => $ships[x].api_name))
    return unmetShips.map(x => parseInt(x))
}


const MiniList = class extends React.Component {
    render() {
        let ret = []
        for (let id of this.props.list) {
            ret.push(<Label bsStyle={this.props.open ? "success" : "default"}
                bsSize="large" key={id}> {$ships[id].api_name} </Label>)
        }
        return (
            <div>
                {ret}
            </div>
        )
    }
}

function inhope(ship_id) {
    return (costalCheck && Coastal_Defense_Ship.indexOf(ship_id) !== -1)
        || (hopeCheck && hopeShips.indexOf(ship_id) !== -1)
        //testing
        //|| ($ships[ship_id].api_stype === 2)
}