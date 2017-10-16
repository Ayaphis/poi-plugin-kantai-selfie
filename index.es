import React, { Component } from 'react'
import { Button, Panel, Checkbox, Label, Col, Grid } from 'react-bootstrap'
const { APPDATA_PATH, i18n, config } = window

const __ = i18n["poi-plugin-kantai-selfie"].__.bind(i18n["poi-plugin-kantai-selfie"])


import { Listener } from './lib/listener'
import { handleCapture } from './lib/capture'


let TypedShipList
let listener
let hopeShips = fleetAnalyse()
let hopeCheck = config.get("plugIn.Selfie", false)
// let costalCheck = true
// const Coastal_Defense_Ship = [517, 518, 524, 525]


export const reactClass = class CapturerUI extends Component {
    state = {
        // costalCheck: costalCheck,
        // costalExpend: false,
        hopeExpend: false,
        hopeCheck: hopeCheck,
        hopelist: hopeShips,

    }
    // costalCheckChange = () => {
    //     costalCheck = !this.state.costalCheck
    //     this.setState({ costalCheck: costalCheck })
    //     //console.log("costal:", costalCheck)
    // }
    hopeCheckChange = () => {
        hopeCheck = !this.state.hopeCheck
        config.set("plugIn.Selfie", hopeCheck)
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
    // expendCoastal = () => {
    //     let x = !this.state.costalExpend
    //     this.setState({ costalExpend: x })
    // }
    expendHope = () => {
        this.setState({ hopeExpend: !this.state.hopeExpend })
    }
    render() {
        return (
            <div id="selfie-main" className="selfie-main-div">
                <Panel collapsible header={__("Testing")} id="selfie-test">
                    <Button onClick={handleHope}>{__("Trigger A Capture")}</Button>
                    {//<Button onClick={this.handleFleetAnalyse}>Generate hopelist</Button>
                    }
                </Panel>
                <Panel collapsible header={__("Capture when ship in below appears")}
                    id="selfie-caplist">
                    <Grid>
                        {/* <Col xs={8}>
                            <Checkbox checked={this.state.costalCheck}
                                onChange={this.costalCheckChange} >Coastal Defense Ship</Checkbox>
                        </Col>
                        <Col xs={4}>
                            <Button onClick={this.expendCoastal}>Detail</Button>
                        </Col>
                        <Col xs={12}>
                            <MiniList
                                light={this.state.costalCheck}
                                open={this.state.costalExpend}
                                list={Coastal_Defense_Ship}
                            />
                        </Col> */}
                        <Col xs={8}>
                            <Checkbox checked={this.state.hopeCheck} onChange={this.hopeCheckChange} >
                                {__("Hope List")}</Checkbox>
                        </Col>
                        <Col xs={4}>
                            <Button onClick={this.expendHope}>{__("Detail")}</Button>
                        </Col>
                        <Col xs={12}>
                            <MiniList
                                light={this.state.hopeCheck}
                                open={this.state.hopeExpend}
                                list={this.state.hopelist}
                            />
                        </Col>
                    </Grid>
                    {/* <TypedShipSetting /> */}
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

function handleHope(ship_id) {
    hopeShips = hopeShips.filter(x => x !== ship_id)
    const shipname = !isNaN(ship_id) ? $ships[ship_id].api_name : "TEST"
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
    TypedShipList = []
    const protoship = {}
    for (const index of freshes) {
        const stype = $ships[index].api_stype
        if (TypedShipList[stype] === undefined)
            TypedShipList[stype] = []
        TypedShipList[stype].push(index)

        const family = []
        protoship[index] = index
        for (let after = $ships[index].api_aftershipid; after !== "0" && family.indexOf(after) === -1; after = $ships[after].api_aftershipid) {
            family.push(after)
            protoship[after] = index
        }
    }
    console.log(TypedShipList)
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
            ret.push(<Label bsStyle={this.props.light ? "success" : "default"}
                key={id}> {$ships[id].api_name} </Label>)
        }
        return (
            <Panel collapsible expanded={this.props.open}>
                {ret}
            </Panel>
        )
    }
}
function inhope(ship_id) {
    return (costalCheck && Coastal_Defense_Ship.indexOf(ship_id) !== -1)
        || (hopeCheck && hopeShips.indexOf(ship_id) !== -1)
    //testing
    //|| ($ships[ship_id].api_stype === 2)
}


class TypedShipSetting extends React.Component {
    state = {
        typeChecks: [],
    }
    changeCheck = (x) => {
        this.state.typeChecks[x] = !this.typeChecks[x]
        this.setState()
    }
    render() {
        const Rows = []
        for (const stype in TypedShipList) {
            const alist = TypedShipList[stype]
            Rows.push(
                <CheckAndDetail
                    name={$shipTypes[stype].api_name}
                    list={alist}
                //checked={this.state.typeChecks[stype]}
                //onChange={this.changeCheck.bind(this, [stype])}
                />
            )
        }

        return (
            <Panel collapsible header="By Ship Types" id="selfie-test">
                <Grid>
                    {Rows}
                </Grid>
            </Panel>
        )
    }

}

class CheckAndDetail extends React.Component {
    state = {
        open: false,
    }
    render() {
        const ret = []
        for (const id of this.props.list) {
            ret.push(" ", <Label bsStyle={this.props.checked ? "success" : "default"}
                key={id}> {$ships[id].api_name} </Label>)
        }
        return (
            <div>
                <Col xs={8}>
                    <Checkbox checked={this.props.checked} onChange={this.props.onChange}>{this.props.name}</Checkbox>
                </Col>
                <Col xs={4}>
                    <Button onClick={() => this.setState({ open: !this.state.open })}>Detail</Button>
                </Col>
                <Col xs={12}>
                    <Panel collapsible expanded={this.state.open} bordered={true}>
                        {ret}
                    </Panel>
                </Col>
            </div>
        )
    }
}