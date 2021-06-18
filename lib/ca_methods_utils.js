/*!
Copyright 2020 Caf.js Labs and contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

const jStat = require('jstat').jStat;
const caf = require('caf_core');
const json_rpc = caf.caf_transport.json_rpc;

const NINETY_CI = 0.10;

exports.isAdmin = function(self) {
    const name = json_rpc.splitName(self.__ca_getName__())[1];
    return (name === self.$.props.adminCA);
};

exports.adminName = function(self) {
    return json_rpc.joinName(json_rpc.splitName(self.__ca_getName__())[0],
                             self.$.props.adminCA);
};

const owner = exports.owner = function(self) {
    return json_rpc.splitName(self.__ca_getName__())[0];
};

exports.localName = function(self) {
    return json_rpc.splitName(self.__ca_getName__())[1];
};

exports.wrapOwner = function(self, name) {
    const o = owner(self);
    let nameSplit = [null];
    try {
        nameSplit = json_rpc.splitName(name);
    } catch (ex) {
        // Continue, not a fully qualified CA name
    }
    return ((o === nameSplit[0]) ? name : json_rpc.joinName(o, name));
};

const computeStats = exports.computeStats = function(self, name) {
    const stat = self.state.stats[name] || [];
    return stat.map(function(x) {
        if (Array.isArray(x) && (x.length > 0)) {
            const res = {
                mean: jStat.mean(x),
                // number of samples < 30 typically, we use student-t
                ci: jStat.tci(0, NINETY_CI, x)[1]
            };
            return res;
        } else {
            return null;
        }
    });
};

exports.timeToFinishMin = function(self, name) {
    const stats = computeStats(self, name);
    const currentPage = (self.state.live && self.state.live.lastInfo &&
                         self.state.live.lastInfo.newPage) || 0;
    let mean = 0.0;
    let ci = 0.0;
    // Each page is an independent random variable with gaussian distribution
    stats.forEach(function(x, i) {
        if ((i >= currentPage) && x && (typeof x.mean === 'number') &&
            !isNaN(x.mean)) {
            mean = mean + x.mean;
            if ((typeof x.ci === 'number') && !isNaN(x.ci)) {
                ci = ci + x.ci*x.ci;
            }
        }
    });

    ci = Math.sqrt(ci);
    // assume worse case
    return mean + ci;
};
