'use strict';

const React = require('react');

const cE = React.createElement;
const AppActions = require('../actions/AppActions');


class Iframe extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            url: ''
        };
    }

    componentDidMount() {
        this.listener = (event) => {
            // TODO: check event.origin
            const oldNum = event.data.old;
            const newNum = event.data.new;
            if ((typeof oldNum === 'number') &&
                (typeof newNum === 'number')) {
                AppActions.changePage(this.props.ctx, oldNum, newNum);
            } else {
                console.log('Ignoring message ' + JSON.stringify(event.data));
            }
        };

        window.addEventListener('message', this.listener, false);

        this.setState({
            url: this.props.slidesURL ? this.props.slidesURL + '/' + this.props.num : ''
        });
    }

    componentWillUnmount() {
        if (this.listener) {
            window.removeEventListener('message', this.listener, false);
            this.listener = null;
        }
    }

    render() {
        const url = this.props.slidesURL ?
            this.props.slidesURL + '/' + this.props.num :
            '';

        return cE('iframe', {
            className: 'iframe-fit',
            frameBorder: 0,
            src: this.state.url
        });
    }
}

module.exports = Iframe;
