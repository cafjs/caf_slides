'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const Iframe = require('./Iframe');

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
        return cE(Iframe, {
            ctx: this.props.ctx,
            slidesURL: this.state.slidesURL,
            num: this.state.currentPage && this.state.currentPage.num || 0,
            step: this.state.currentPage && this.state.currentPage.step || 0
        });
    };
}

module.exports = MyApp;
