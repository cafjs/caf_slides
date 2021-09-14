'use strict';

const React = require('react');

const cE = React.createElement;
const AppActions = require('../actions/AppActions');

class Iframe extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url: '',
            pageNum: 0,
            step: 0
        };
        this.iframeRef = React.createRef();
    }

    componentDidMount() {
        this.listener = (event) => {
            // TODO: check event.origin
            if (this.props.isReplica) {
                const pageNum = event.data.new;
                const step = event.data.step || 0;
                this.setState({pageNum, step});
            } else {
                const oldNum = event.data.old;
                const newNum = event.data.new;
                const step = event.data.step || 0;

                if ((typeof oldNum === 'number') &&
                    (typeof newNum === 'number')) {
                    AppActions.changePage(this.props.ctx, oldNum, newNum, step);
                } else {
                    console.log('Ignoring message ' +
                                JSON.stringify(event.data));
                }
            }
        };

        window.addEventListener('message', this.listener, false);

        this.setState({
            url: this.props.slidesURL ?
                this.props.slidesURL + '#' + this.props.num :
                '',
            pageNum: this.props.num || 0,
            step: 0
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.slidesURL !== this.props.slidesURL) {
            this.setState({
                url: this.props.slidesURL ?
                    this.props.slidesURL + '#' + this.props.num :
                    '',
                pageNum: this.props.num || 0,
                step: 0
            });
        }

        if (this.props.isReplica) {
            if ((this.state.pageNum < this.props.num) ||
                ((this.state.pageNum === this.props.num) &&
                 (this.state.step < this.props.step))) {
                this.sendToIframe('increment');
            }

            if ((this.state.pageNum > this.props.num) ||
                ((this.state.pageNum === this.props.num) &&
                 (this.state.step > this.props.step))) {
                this.sendToIframe('decrement');
            }
        }
    }

    componentWillUnmount() {
        if (this.listener) {
            window.removeEventListener('message', this.listener, false);
            this.listener = null;
        }
    }

    sendToIframe(action) {
        this.iframeRef.current.contentWindow.postMessage({action}, '*');
    }

    render() {
        return cE('iframe', {
            ref: this.iframeRef,
            className: 'iframe-fit',
            frameBorder: 0,
            src: this.state.url
        });
    }
}

module.exports = Iframe;
