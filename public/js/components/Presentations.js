'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;
const AppActions = require('../actions/AppActions');
const PresentationsTable = require('./PresentationsTable');

class Presentations extends React.Component {

    constructor(props) {
        super(props);
        this.handleName = this.handleName.bind(this);
        this.handleURL = this.handleURL.bind(this);
        this.doAdd = this.doAdd.bind(this);
        this.doDelete = this.doDelete.bind(this);
        this.doStats = this.doStats.bind(this);
        this.doReset = this.doReset.bind(this);
    }

    handleName(e) {
        const pres = Object.assign({}, this.props.localPresentations, {
            name: e.target.value
        });
        AppActions.setLocalState(this.props.ctx, {localPresentations: pres});
    }

    handleURL(e) {
        const pres = Object.assign({}, this.props.localPresentations, {
            url: e.target.value
        });
        AppActions.setLocalState(this.props.ctx, {localPresentations: pres});
    }

    doAdd(ev) {
        if (this.props.localPresentations &&
            this.props.localPresentations.name &&
            this.props.localPresentations.url) {
            AppActions.changeURL(this.props.ctx,
                                 this.props.localPresentations.name,
                                 this.props.localPresentations.url);
        } else {
            const err = new Error('Missing arguments');
            AppActions.setError(this.props.ctx, err);
        }
    }

    doDelete(ev) {
        if (this.props.localPresentations &&
            this.props.localPresentations.name) {
            AppActions.changeURL(this.props.ctx,
                                 this.props.localPresentations.name,
                                 null);
        } else {
            const err = new Error('Missing arguments');
            AppActions.setError(this.props.ctx, err);
        }
    }

    doStats(ev) {
        if (this.props.localPresentations &&
            this.props.localPresentations.name) {
            AppActions.getStats(this.props.ctx,
                                this.props.localPresentations.name);
        } else {
            const err = new Error('Missing arguments');
            AppActions.setError(this.props.ctx, err);
        }
    }

    doReset(ev) {
        if (this.props.localPresentations &&
            this.props.localPresentations.name) {
            AppActions.resetStats(this.props.ctx,
                                  this.props.localPresentations.name);
        } else {
            const err = new Error('Missing arguments');
            AppActions.setError(this.props.ctx, err);
        }
    }

    render() {
        return cE(rB.Form, {horizontal: true},
                  cE(rB.FormGroup, {controlId: 'namePresId'},
                     cE(rB.Col, {sm:6, xs:12},
                        cE(rB.ControlLabel, null, 'Name')
                       ),
                     cE(rB.Col, {sm: 6, xs: 12},
                        cE(rB.FormControl, {
                            type: 'text',
                            value:  this.props.localPresentations.name || '',
                            onChange: this.handleName
                        })
                       )
                    ),
                  cE(rB.FormGroup, {controlId: 'urlId'},
                     cE(rB.Col, {sm:6, xs:12},
                        cE(rB.ControlLabel, null, 'URL')
                       ),
                     cE(rB.Col, {sm: 6, xs: 12},
                        cE(rB.FormControl, {
                            type: 'text',
                            value:  this.props.localPresentations.url || '',
                            onChange: this.handleURL
                        })
                       )
                    ),
                  cE(rB.FormGroup, {controlId: 'actionsId'},
                     cE(rB.Col, {smOffset: 6, sm:6, xs:12},
                        cE(rB.ButtonGroup, null,
                           cE(rB.Button, {
                               onClick: this.doAdd
                           }, "Add"),
                           cE(rB.Button, {
                               bsStyle: 'danger',
                               onClick: this.doDelete
                           }, "Delete"),
                           cE(rB.Button, {
                               onClick: this.doStats
                           }, "Stats"),
                           cE(rB.Button, {
                               bsStyle: 'danger',
                               onClick: this.doReset
                           }, "Reset")
                          )
                       )
                    ),
                  cE(rB.FormGroup, {controlId: 'tableId'},
                     cE(rB.Col, {xs:12, sm:12},
                        cE(PresentationsTable, {
                            presentations: this.props.presentations
                        })
                       )
                    )
                 );
    }
};

module.exports = Presentations;
