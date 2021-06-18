const React = require('react');
const rB = require('react-bootstrap');
const cE = React.createElement;

class PresentationsTable extends React.Component {

    constructor(props) {
        super(props);
        this.oldMap = null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        const newMap = nextProps.presentations;
        return (this.oldMap !== newMap);
    }

    render() {
        this.oldMap = this.props.presentations;
        const presentations = (this.oldMap && this.oldMap.toObject()) || {};
        const keys = Object.keys(presentations).sort().filter(function(x) {
            return (x.indexOf('__ca_') !== 0);
        });

        return cE(rB.Table, {striped: true, responsive: true, bordered: true,
                             condensed: true, hover: true},
                  cE('thead', {key:0},
                     cE('tr', {key:1},
                        cE('th', {key:2}, 'Name'),
                        cE('th', {key:3}, 'URL')
                       )
                    ),
                  cE('tbody', {key:8},
                     keys.map((x, i) =>
                              cE('tr', {key:10*i +1000},
                                 cE('td', {key:10*i+1001}, x),
                                 cE('td', {key:10*i+1002}, presentations[x])
                                )
                             )
                    )
                 );
    }
};

module.exports = PresentationsTable;
