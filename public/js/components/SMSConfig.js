'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class SMSConfig extends React.Component {

    constructor(props) {
        super(props);
        this.handleApiKey = this.handleApiKey.bind(this);
        this.handleApiSecret = this.handleApiSecret.bind(this);
        this.handleFrom = this.handleFrom.bind(this);
        this.handleTo = this.handleTo.bind(this);

        this.doSubmit = this.doSubmit.bind(this);
        this.doDismiss = this.doDismiss.bind(this);
    }

    doSubmit(ev) {
        AppActions.changeSMS(this.props.ctx, this.props.localSMS);
        AppActions.setLocalState(this.props.ctx, {localSMS: null});
    }

    doDismiss(ev) {
        AppActions.setLocalState(this.props.ctx, {localSMS: null});
    }

    handleApiKey(e) {
        const sms = Object.assign({}, this.props.localSMS, {
            api_key: e.target.value
        });
        AppActions.setLocalState(this.props.ctx, {localSMS: sms});
    }

    handleApiSecret(e) {
        const sms = Object.assign({}, this.props.localSMS, {
            api_secret: e.target.value
        });
        AppActions.setLocalState(this.props.ctx, {localSMS: sms});
    }

    handleFrom(e) {
        const sms = Object.assign({}, this.props.localSMS, {
            from: e.target.value
        });
        AppActions.setLocalState(this.props.ctx, {localSMS: sms});
    }

    handleTo(e) {
        const sms = Object.assign({}, this.props.localSMS, {
            to: e.target.value
        });
        AppActions.setLocalState(this.props.ctx, {localSMS: sms});
    }

    render() {
        return cE(rB.Modal, {show: !!this.props.localSMS,
                             onHide: this.doDismiss,
                             animation: false},
                  cE(rB.Modal.Header, {closeButton: true},
                     cE(rB.Modal.Title, null, 'SMS config for Nexmo service')
                    ),
                  cE(rB.ModalBody, null,
                     cE(rB.Form, {horizontal: true},
                        cE(rB.FormGroup, {controlId: 'apiKeyId'},
                           cE(rB.Col, {sm:6, xs:12},
                              cE(rB.ControlLabel, null, 'API Key')
                             ),
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.FormControl, {
                                  type: 'text',
                                  value: this.props.localSMS &&
                                      this.props.localSMS.api_key || '',
                                  onChange: this.handleApiKey
                              })
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'apiSecretId'},
                           cE(rB.Col, {sm:6, xs:12},
                              cE(rB.ControlLabel, null, 'API Secret')
                             ),
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.FormControl, {
                                  type: 'password',
                                   value: this.props.localSMS &&
                                      this.props.localSMS.api_secret || '',
                                  onChange: this.handleApiSecret
                              })
                             )
                          ),
                        cE(rB.FormGroup, {controlId: 'callerId'},
                           cE(rB.Col, {sm:6, xs:12},
                              cE(rB.ControlLabel, null, 'Caller #')
                             ),
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.FormControl, {
                                  type: 'password',
                                  value: this.props.localSMS &&
                                      this.props.localSMS.from || '',
                                  onChange: this.handleFrom
                              })
                             )
                          ),
                         cE(rB.FormGroup, {controlId: 'receiverId'},
                           cE(rB.Col, {sm:6, xs:12},
                              cE(rB.ControlLabel, null, 'Receiver #')
                             ),
                           cE(rB.Col, {sm: 6, xs: 12},
                              cE(rB.FormControl, {
                                  type: 'password',
                                  value: this.props.localSMS &&
                                      this.props.localSMS.to || '',
                                  onChange: this.handleTo
                              })
                             )
                           )
                       )
                    ),
                  cE(rB.Modal.Footer, null,
                     cE(rB.Button, {onClick: this.doDismiss}, 'Ignore'),
                     cE(rB.Button, {
                         onClick: this.doSubmit, bsStyle: 'danger'
                     }, 'Submit')
                    )
                 );
    }
};

module.exports = SMSConfig;
