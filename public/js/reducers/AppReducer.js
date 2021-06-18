const AppConstants = require('../constants/AppConstants');
const redux = require('redux');

const AppReducer = function(state, action) {
    if (typeof state === 'undefined') {
        return  {localPresentations: {}, localRun: null, isClosed: false};
    } else {
        switch(action.type) {
        case AppConstants.APP_UPDATE:
        case AppConstants.APP_NOTIFICATION:
            const pres = action.map ?
                {presentations: action.map.toImmutableObject()} : {};
            return Object.assign({}, state, action.state, pres);
        case AppConstants.APP_ERROR:
            return Object.assign({}, state, {error: action.error});
        case AppConstants.WS_STATUS:
            return Object.assign({}, state, {isClosed: action.isClosed});
        default:
            return state;
        }
    };
};

module.exports = AppReducer;
