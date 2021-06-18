'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const AppActions = require('../actions/AppActions');
const ListNotif = require('./ListNotif');
const AppStatus = require('./AppStatus');
const DisplayError = require('./DisplayError');
const DisplayStats = require('./DisplayStats');
const SMSConfig = require('./SMSConfig');
const AlertInfo = require('./AlertInfo');
const Run = require('./Run');
const Presentations =  require('./Presentations');

const cE = React.createElement;

class MyApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props.ctx.store.getState();
    }

    componentDidMount() {
        if (!this.unsubscribe) {
            this.unsubscribe = this.props.ctx.store
                .subscribe(this._onChange.bind(this));
            this._onChange();
        }
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    _onChange() {
        if (this.unsubscribe) {
            this.setState(this.props.ctx.store.getState());
        }
    }

    render() {
        return cE('div', {className: 'container-fluid'},
                  cE(DisplayError, {
                      ctx: this.props.ctx,
                      error: this.state.error
                  }),
                  cE(SMSConfig, {
                      ctx: this.props.ctx,
                      localSMS: this.state.localSMS
                  }),
                   cE(DisplayStats, {
                      ctx: this.props.ctx,
                      localStats: this.state.localStats
                   }),
                  cE(rB.Panel, null,
                     cE(rB.Panel.Heading, null,
                        cE(rB.Panel.Title, null,
                           cE(rB.Grid, {fluid: true},
                              cE(rB.Row, null,
                                 cE(rB.Col, {sm:1, xs:1},
                                    cE(AppStatus, {
                                        isClosed: this.state.isClosed
                                    })
                                   ),
                                 cE(rB.Col, {
                                     sm: 5,
                                     xs:10,
                                     className: 'text-right'
                                 }, 'Presentation Manager'),
                                 cE(rB.Col, {
                                     sm: 5,
                                     xs:11,
                                     className: 'text-right'
                                 }, this.state.fullName || '')
                                )
                             )
                          )
                       ),
                     cE(rB.Panel.Body, null,
                        cE(rB.Panel, null,
                           cE(rB.Panel.Heading, null,
                              cE(rB.Panel.Title, null, 'Alert')
                             ),
                           cE(rB.Panel.Body, null,
                              cE(AlertInfo, {
                                  ctx: this.props.ctx,
                                  sms: this.state.sms,
                                  alarmActive: this.state.alarmActive,
                                  sentSMS: this.state.sentSMS
                              })
                             )
                          ),
                        cE(rB.Panel, null,
                           cE(rB.Panel.Heading, null,
                              cE(rB.Panel.Title, null, 'Run')
                             ),
                           cE(rB.Panel.Body, null,
                              cE(Run, {
                                  ctx: this.props.ctx,
                                  localRun: this.state.localRun ||
                                      this.state.live,
                                  recording: this.state.recording,
                                  live: this.state.live
                              })
                             )
                          ),
                        cE(rB.Panel, null,
                           cE(rB.Panel.Heading, null,
                              cE(rB.Panel.Title, null, 'Presentations')
                             ),
                           cE(rB.Panel.Body, null,
                              cE(Presentations, {
                                  ctx: this.props.ctx,
                                  localPresentations:
                                  this.state.localPresentations,
                                  presentations: this.state.presentations
                              })
                             )
                          )
                       )
                    )
                 );
    }
};

module.exports = MyApp;
