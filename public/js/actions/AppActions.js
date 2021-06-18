'use strict';

const AppConstants = require('../constants/AppConstants');
const json_rpc = require('caf_transport').json_rpc;
const MAP_UPDATE = 'mapUpdate';

const updateF = function(store, state, map) {
    const d = {
        type: AppConstants.APP_UPDATE,
        state: state,
        map: map
    };
    store.dispatch(d);
};

const errorF =  function(store, err) {
    const d = {
        type: AppConstants.APP_ERROR,
        error: err
    };
    store.dispatch(d);
};

const getNotifData = function(msg) {
    return json_rpc.getMethodArgs(msg)[0];
};

const notifyF = function(store, message) {
    const d = {
        type: AppConstants.APP_NOTIFICATION,
        state: getNotifData(message)
    };
    store.dispatch(d);
};

const wsStatusF =  function(store, isClosed) {
    const d = {
        type: AppConstants.WS_STATUS,
        isClosed: isClosed
    };
    store.dispatch(d);
};

const AppActions = {
    async init(ctx) {
        try {
            const data = await ctx.session.hello(ctx.session.getCacheKey())
                  .getPromise();
            await AppActions.getMap(ctx);
            updateF(ctx.store, data);
            return data;
        } catch (err) {
            errorF(ctx.store, err);
            throw err; // rethrow to show html error page
        }
    },
    async getStats(ctx, name) {
        try {
            const data = await ctx.session.getStats(name).getPromise();
            updateF(ctx.store, {localStats: {data, name}});
        } catch (err) {
            errorF(ctx.store, err);
        }
    },
    async getMap(ctx) {
        try {
            const delta = await ctx.session.getMap(ctx.map.getVersion())
                  .getPromise();
            ctx.map.applyChanges(delta);
            updateF(ctx.store, {}, ctx.map);
        } catch (err) {
            errorF(ctx.store, err);
        }
    },
    message(ctx, msg) {
        const data = getNotifData(msg);
        console.log('message:' + JSON.stringify(data));
        if (data.type === MAP_UPDATE) {
            AppActions.getMap(ctx);
        } else {
            AppActions.getState(ctx);
        }
    },
    closing(ctx, err) {
        console.log('Closing:' + JSON.stringify(err));
        wsStatusF(ctx.store, true);
    },
    setLocalState(ctx, data) {
        updateF(ctx.store, data);
    },
    resetError(ctx) {
        errorF(ctx.store, null);
    },
    setError(ctx, err) {
        errorF(ctx.store, err);
    }
};

['changeSMS', 'changeURL', 'changeIsRecording', 'changeIsLive', 'resetStats',
 'changePage', 'getState', 'alarmActive'].forEach(function(x) {
     AppActions[x] = async function() {
         const args = Array.prototype.slice.call(arguments);
         const ctx = args.shift();
         try {
             const data = await ctx.session[x].apply(ctx.session, args)
                   .getPromise();
             updateF(ctx.store, data);
         } catch (err) {
             errorF(ctx.store, err);
         }
     };
});


module.exports = AppActions;
