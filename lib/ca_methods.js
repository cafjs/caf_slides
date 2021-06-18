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
const caf = require('caf_core');
const json_rpc = caf.caf_transport.json_rpc;
const presUtils = require('./ca_methods_utils');

const PAGE_CHANGE_SUFFIX = '-pageChange';
const APP_SESSION = 'default';

exports.methods = {

    async __ca_init__() {
        // presentationName -> Array.<Array.<number>>
        // e.g., my_presentation -> [page#][duration_samples_in_minutes]
        this.state.stats = {};
        this.state.recording = false;
        // {name: string, warnDone: boolean, durationMin: number, start: number,
        //  lastTimeToFinishMin: number, lastInfo: {oldPage: number,
        //                               newPage: number, durationMin: number}}}
        this.state.live = null;
        this.state.sms = {};
        this.state.alarmActive = false;
        this.state.sentSMS = false;
        // currentPage type is {num: number, time: number}
        this.state.currentPage = null;

        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.isAdmin = presUtils.isAdmin(this);
        this.$.session.limitQueue(2, APP_SESSION);

        if (this.state.isAdmin) {
            this.$.sharing.addWritableMap('primary', 'presentations');
            this.state.lastMapVersion = -1;
            this.state.pubsubTopic = this.$.pubsub.FORUM_PREFIX +
                this.__ca_getName__() + PAGE_CHANGE_SUFFIX;
            this.$.pubsub.subscribe(this.state.pubsubTopic,
                                    '__ca_handlePageChange__');
            const rule = this.$.security.newSimpleRule(
                '__ca_handlePageChange__',
                presUtils.owner(this)
            );
            this.$.security.addRule(rule);
        } else {
            this.state.slidesURL = null;
            this.state.pubsubTopic = this.$.pubsub.FORUM_PREFIX +
                presUtils.adminName(this) + PAGE_CHANGE_SUFFIX;
        }

        const fullMapName = json_rpc.joinName(presUtils.adminName(this),
                                              'presentations');
        this.$.sharing.addReadOnlyMap('presentations', fullMapName,
                                      {bestEffort: true});

        return [];
    },

    async __ca_pulse__() {
        this.$.log && this.$.log.debug('calling PULSE!!! ');
        const live = this.state.live;
        if (this.state.isAdmin) {
            // Check for updated maps
            const $$ = this.$.sharing.$;
            if ($$.presentations) {
                const version = $$.presentations.getVersion();
                if (version > this.state.lastMapVersion) {
                    this.$.session.notify([{type: 'mapUpdate', value: version}],
                                          APP_SESSION);
                    this.state.lastMapVersion = version;
                }
            }
            // Check for alarm in the middle of the presentation
            if (live) {
                const t = presUtils.timeToFinishMin(this, live.name);
                this.state.live.lastTimeToFinishMin = Math.floor(t*100)/100.0;
                this.$.session.notify([{type: 'timeToFinish', value: t}],
                                       APP_SESSION);
                if (this.state.alarmActive && !live.warnDone) {
                    const now = (new Date()).getTime();
                    const middle = live.start + 60*1000*(live.durationMin/2);
                    if (now > middle) {
                        live.warnDone = true;
                        this.$.log &&
                            this.$.log.debug('Processing Warn in PULSE!');
                        if (t > live.durationMin/2) {
                            const diff =
                                  Math.floor(60*(t - live.durationMin/2));
                            const msg = 'Too slow, late by ' + diff +
                                  ' seconds.';
                            this.$.log && this.$.log.debug(msg);
                            if (this.state.sms && this.state.sms.to) {
                                this.state.sentSMS = true;
                                this.$.sms.send(this.state.sms.to, msg);
                            }
                            this.$.session.notify([{type: 'alarm', value: msg}],
                                                  APP_SESSION);
                        } else {
                            const diff2 =
                                  Math.floor(60*(live.durationMin/2 -t));
                            const msg2 = 'Doing fine, extra ' + diff2 +
                                    ' seconds.';
                            this.$.log && this.$.log.debug(msg2);
                        }
                    }
                }
            }
        } else {
            // non-admin CA
            const $$ = this.$.sharing.$;
            if ($$.presentations) {
                const url = $$.presentations.get(presUtils.localName(this));
                if (this.state.slidesURL !== url) {
                    this.state.slidesURL = url;
                    this.$.session.notify([{type: 'newURL', value: url}],
                                          APP_SESSION);
                }
            } else {
                // try again...
                const fullMapName = json_rpc.joinName(presUtils.adminName(this),
                                                      'presentations');
                this.$.sharing.addReadOnlyMap('presentations', fullMapName,
                                              {bestEffort: true});
            }
        }
        return [];
    },

    async hello(key) {
        return this.getState();
    },

    async alarmActive(active) {
        this.state.alarmActive = active;
        return this.getState();
    },

    // sms type is {api_key:string, api_secret:string, from:number, to:number},
    // see caf_sms lib for details.
    async changeSMS(sms) {
        this.state.sms = sms;
        sms && this.$.sms.setConfig(sms);
        return this.getState();
    },

    async changeURL(key, newURL) {
        if (this.state.isAdmin) {
            key = presUtils.wrapOwner(this, key);
            const $$ = this.$.sharing.$;
            if (newURL === null) {
                $$.primary.delete(key);
            } else {
                $$.primary.set(key, newURL);
            }
            return this.getState();
        } else {
            return [new Error('Not an admin')];
        }
    },

    /*
     * isRecording: boolean
     */
    async changeIsRecording(isRecording) {
        this.state.recording = isRecording;
        return this.getState();
    },

    /*
     * live: {name: string, durationMin: number, start: number,
     * warnDone: boolean, lastInfo: {oldPage: number, newPage: number,
     *                               durationMin: number}}
     */
    async changeIsLive(live) {
        this.state.sentSMS = false;
        this.state.recording = (live ? true : false);
        if (live && !this.state.live) {
            live.start = live.start || (new Date()).getTime();
        }
        if (live && live.name) {
            live.name = presUtils.wrapOwner(this, live.name);
        }
        this.state.live = live;
        return this.getState();
    },

    async resetStats(name) {
        if (name) {
            name = presUtils.wrapOwner(this, name);
            delete this.state.stats[name];
        } else {
            this.state.stats = {};
        }
        return this.getState();
    },

    async getStats(name) {
        let stats = null;
        if (name) {
            name = presUtils.wrapOwner(this, name);
            stats = (this.state.stats[name] ?
                     presUtils.computeStats(this, name) : null);
        }
        return [null, stats];
    },

    // called by slides in non-admin CA
    async changePage(oldPage, newPage) {
        const now = (new Date()).getTime();
        if (this.state.currentPage &&
            (this.state.currentPage.num === oldPage) &&
            (oldPage !== newPage)) {
            this.$.pubsub.publish(this.state.pubsubTopic, JSON.stringify({
                durationMin: (now - this.state.currentPage.time) / 60000,
                oldPage: oldPage,
                newPage: newPage
            }));
        }

        this.$.log && this.$.log.debug('<<< Changing page time: ' + now +
                                       ' old page: ' + oldPage +
                                       ' new page: ' + newPage);
        this.state.currentPage = {num: newPage, time: now};
        return this.getState();
    },

    async getMap(version) {
        const $$ = this.$.sharing.$;
        if ($$.presentations) {
            return [null, this.$.sharing.pullUpdate('presentations', version)];
        } else {
            return [new Error('Missing presentations map')];
        }
    },

    async getState() {
        return [null, this.state];
    },

    //Called by the pubsub plugin in admin CA

    // topic is this.$.pubsub.FORUM_PREFIX + me + PAGE_CHANGE_SUFFIX
    // info is of type {oldPage: number, newPage: number, durationMin: number}
    //     after JSON parsing
    async __ca_handlePageChange__(topic, info, caller) {
        this.$.log && this.$.log.debug(
            `__ca_handlePageChange__: ${topic} ${info} ${caller}`
        );
        const callerOwner = json_rpc.splitName(caller)[0];
        if (!this.state.isAdmin || (presUtils.owner(this) !== callerOwner) ||
            (topic !== this.state.pubsubTopic)) {
            const error = new Error('Cannot handle page change');
            error.topic = topic;
            error.info = info;
            error.caName = this.__ca_getName__();
            return [error];
        } else {
            if (this.state.recording) {
                this.$.log && this.$.log.debug('Recording page change ' + info);
                info = JSON.parse(info);
                const durationMsec = info.durationMin*60*1000;
                // No browsing or coffee break...
                if ((durationMsec > this.$.props.minPageTime) &&
                    (durationMsec < this.$.props.maxPageTime)) {
                    const statCaller = this.state.stats[caller] || [];
                    const all = statCaller[info.oldPage] || [];
                    all.push(info.durationMin);
                    statCaller[info.oldPage] = all;
                    this.state.stats[caller] = statCaller;
                }
                if (this.state.live) {
                    this.state.live.lastInfo = info;
                }
            }
            return [];
        }
    }
};

caf.init(module);
