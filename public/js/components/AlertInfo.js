'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class AlertInfo extends React.Component {

    constructor(props) {
        super(props);
        this.handleConfigSMS = this.handleConfigSMS.bind(this);
        this.handleAlarm = this.handleAlarm.bind(this);
    }

    handleConfigSMS() {
        const sms = {...this.props.sms};
        AppActions.setLocalState(this.props.ctx, {localSMS: sms});
    }

    handleAlarm(e) {
        AppActions.alarmActive(this.props.ctx, e.target.checked);
    }

    render() {
        return cE(rB.Form, {horizontal: true},
                  cE(rB.FormGroup, {controlId: 'alertId'},
                     cE(rB.Col, {xs:4, sm:4},
                        cE(rB.Checkbox, {
                            checked: this.props.alarmActive,
                            onChange: this.handleAlarm
                        }, 'Alarm ON')
                       ),
                     cE(rB.Col, {xs:4, sm:4},
                        cE(rB.ControlLabel, null,
                           (this.props.sentSMS ? cE(rB.Glyphicon, {
                               glyph: 'send',
                               className: 'text-danger'
                           }) : 'No SMS sent')
                          )
                       ),
                     cE(rB.Col, {xs:4, sm:4},
                        cE(rB.Button, {
                            onClick: this.handleConfigSMS
                        }, 'Config SMS')
                       )
                    )
                 );
    }
};

module.exports = AlertInfo;
