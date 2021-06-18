'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');


class Run extends React.Component {

    constructor(props) {
        super(props);
        this.handleName = this.handleName.bind(this);
        this.handleTime = this.handleTime.bind(this);

        this.doStart = this.doStart.bind(this);
        this.doStop = this.doStop.bind(this);
    }

    handleName(e) {
        const run = Object.assign({}, this.props.localRun || {}, {
            name: e.target.value
        });
        AppActions.setLocalState(this.props.ctx, {localRun: run});
    }

    handleTime(e) {
        const run = Object.assign({}, this.props.localRun || {}, {
            durationMin: e.target.value
        });
        AppActions.setLocalState(this.props.ctx, {localRun: run});
    }

    doStart(ev) {
        if (this.props.localRun && this.props.localRun.name &&
            this.props.localRun.durationMin) {
            AppActions.changeIsLive(this.props.ctx, {
                name: this.props.localRun.name,
                durationMin : this.props.localRun.durationMin,
                readOnly: true
            });
            AppActions.setLocalState(this.props.ctx, {localRun: null});
        } else {
            const err = new Error('Missing arguments');
            AppActions.setError(this.props.ctx, err);
        }
    }

    doStop(ev) {
        AppActions.changeIsLive(this.props.ctx, null);
        AppActions.setLocalState(this.props.ctx, {localRun: null});
    }

    render() {
        const now = (new Date()).getTime();
        let timeLeftMin = this.props.localRun && this.props.live &&
                (this.props.localRun.durationMin -
                 (now - this.props.live.start)/60000) || 0;
        timeLeftMin = Math.floor(timeLeftMin*100)/100.0;

        return cE(rB.Form, {horizontal: true}, [
            cE(rB.FormGroup, {controlId: 'nameId', key: 14},
               cE(rB.Col, {sm:6, xs:12},
                  cE(rB.ControlLabel, null, 'Name')
                 ),
               cE(rB.Col, {sm: 6, xs: 12},
                  cE(rB.FormControl, {
                      type: 'text',
                      readOnly: this.props.localRun &&
                          this.props.localRun.readOnly,
                      value: this.props.localRun &&
                          this.props.localRun.name || '',
                      onChange: this.handleName
                  })
                 )
              ),
            cE(rB.FormGroup, {controlId: 'durationId', key: 15},
               cE(rB.Col, {sm: 6, xs: 12},
                  cE(rB.ControlLabel, null, 'Total Time (Min)')
                 ),
               cE(rB.Col, {sm: 6, xs: 12},
                  cE(rB.FormControl, {
                      type: 'text',
                      value: this.props.localRun &&
                          this.props.localRun.durationMin || '',
                      onChange: this.handleTime
                  })
                 )
              ),
            this.props.recording &&
                cE(rB.FormGroup, {controlId: 'timeleftId', key: 16},
                   cE(rB.Col, {sm: 6, xs: 12},
                      cE(rB.ControlLabel, null, 'Time Left (Min)')
                     ),
                   cE(rB.Col, {sm: 6, xs: 12},
                      cE(rB.FormControl, {
                          type: 'text',
                          readOnly: true,
                          value: timeLeftMin
                      })
                     )
                  ),
            this.props.recording &&
                cE(rB.FormGroup, {controlId: 'timeneedId', key: 17},
                   cE(rB.Col, {sm: 6, xs: 12},
                      cE(rB.ControlLabel, null, 'Time Needed (Min)')
                     ),
                   cE(rB.Col, {sm: 6, xs: 12},
                      cE(rB.FormControl, {
                          type: 'text',
                          readOnly: true,
                          value: this.props.live &&
                              this.props.live.lastTimeToFinishMin
                      })
                     )
                  ),
            cE(rB.FormGroup, {controlId: 'butId', key: 18},
               cE(rB.Col, {smOffset: 6, sm:6, xs:12},
                  cE(rB.ButtonGroup, null,
                     cE(rB.Button, {
                         onClick: this.doStart
                     }, 'Start'),
                     cE(rB.Button, {
                         bsStyle: 'danger',
                         onClick: this.doStop
                     }, 'Stop'),
                     cE(rB.Button, {disabled: true},
                        (this.props.recording ? cE(rB.Glyphicon, {
                            glyph: 'record',
                            className: 'text-danger'
                        }) : 'Not Recording')
                       )
                    )
                 )
              )
        ].filter(x => !!x));
    }
};

module.exports = Run;
