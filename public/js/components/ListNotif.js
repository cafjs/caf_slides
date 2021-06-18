'use strict';

const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;

class ListNotif extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const reverse = this.props.notif.slice(0).reverse();
        return cE(rB.ListGroup, null,
                  reverse.map((x, i) => cE(rB.ListGroupItem, {key:i},
                                           'counter: ', cE(rB.Badge, null, x)))
                 );
    }
};


module.exports = ListNotif;
