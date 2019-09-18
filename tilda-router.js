// Wraps script in an anonymous function so that it can't be affected
// by other scripts and does not interact with other scripts itself.
// Ensures jQuery / window are the only things declared as $ / window.
;(function($, window) {
    const _debugRouting = false;

    function log(msg, ...args) {
        if (_debugRouting) {
            console.log(msg, ...args);
        }
    }

    function getCurrentRelativeUrl() {
        return window.location.pathname + window.location.hash + window.location.search;
    }

    // IMPORTANT: The class is the shared state between the "Header"
    //            and "Tilda Overrides" scripts (i.e. page scripts).
    class Router {

        constructor(initLocation, config) {
            // IMPORTANT: It DOES NOT support multi-page navigation yet!
            const initHash = initLocation.hash,
                  queryStr = initLocation.search;

            this.config = config || {
                attractors: []
            };

            this.stateObject = {
                hashName: '',
                queryStr: queryStr,
                stateName: 'init',
                timestamp: Date.now(),
                scrollPos: 0
            };
            this.stateObject.prevState = this.stateObject;
            this.lastHashBeforePopup = '';

            // NOTE: Overriding Tilda behavior only in this particular case.
            if (window.history) {
                if ('scrollRestoration' in window.history) {
                    window.history.scrollRestoration = 'manual';
                }

                const url = window.location.pathname + this.stateObject.queryStr;
                log('inception: %s —> %s', getCurrentRelativeUrl(), url);
                window.history.replaceState(this.stateObject, null, url);

                const _self = this;
                $(window).on('popstate', function(e) {
                    // process the navigation logic, including page scrolling
                    const state = e.originalEvent.state;
                    if (state) {
                        _self.processNavigation(state, { history: {}});
                    } else {
                        _self.processNavigation({
                            hashName: window.location.hash,
                            queryStr: window.location.search
                        });
                    }
                });

                $(document).ready(function() {
                    // first, disable the regular Tilda hash-links navigation
                    $('a[href*=#]:not([href=#],[href^=#popup],[href^=#prodpopup])')
                        .off('click')
                        .on('click', function() {
                            _self.processNavigation({
                                hashName: this.hash,
                                queryStr: ''
                            });
                            return false;
                        });
                    // then, navigate for the inception nav state to persist
                    if (initHash !== '') {
                        _self.processNavigation({
                            hashName: initHash,
                            queryStr: ''
                        }, {
                            isInitCall: true
                        });
                    }
                });
            } else {
                if (initHash !== '') {
                    window.location.hash = '' + this.stateObject.queryStr;
                    setTimeout(function() {
                        window.location.hash = initHash;
                    }, 500);
                }
            }
        }

        // --- auxiliary methods -----------------------------------------------

        static getScrollPos(hashName) {
            // NOTE: Tilda's implementation.
            let target = $(hashName);
            if (target.length === 0) {
                target = $('a[name="' + hashName.substr(1) + '"]');
            }
            if (target.length === 0) {
                return 0;
            }
            return target.offset().top + 3;
        }
        static scrollTo(scrollPos, immediate) {
            if (immediate) {
                window.scrollTo(0, scrollPos)
            } else {
                $('html, body').animate({
                    scrollTop: scrollPos
                }, 300)
            }
        }

        switchNavState(stateObject, meta) {
            const currState = this.stateObject,
                   queryStr = currState.queryStr || '';

            // NOTE: Saves current intra-block scroll position for later reuse.
            //       Here we have to be extra causious about modifying current
            //       state since it have to be relevant to this change — since
            //       URL might change so far, srsly — and hold consistent data.
            if (this.doSaveScrollPos(stateObject, meta) && window.history) {
                currState.scrollPos = window.scrollY - Router.getScrollPos(currState.hashName);
                log('saveScrollPos: %s = %s', currState.hashName, currState.scrollPos);
                window.history.replaceState(currState, null,
                    window.location.pathname + currState.hashName + queryStr);
            }

            // NOTE: Persists only the previously unprocessed nav state.
            if (!stateObject.timestamp) {
                stateObject.timestamp = Date.now();
                stateObject.prevState = Object.assign({}, currState);

                const url = window.location.pathname + stateObject.hashName + queryStr;
                log('switchNavState: %s –> %s', getCurrentRelativeUrl(), url);
                if (window.history) {
                    window.history.pushState(stateObject, null, url)
                } else {
                    window.location.assign(url) // fallback
                }
            }
            this.stateObject = stateObject;
        }
        goToPrevNavState(meta) {
            const currState = this.stateObject;
            log('goToPrevNavState: %s –> %s', currState.hashName, currState.prevState.hashName);

            // noinspection JSUnusedAssignment
            meta = this.prepareNavigationMeta(meta);

            // NOTE: Saves current intra-block scroll position for later reuse
            //       and updates it here since 'back()' will change nav state.
            //if (this.doSaveScrollPos(currState.prevState, meta) && window.history) {
            //    currState.scrollPos = window.scrollY - this.getScrollPos(currState.hashName);
            //    window.history.replaceState(currState, null,
            //        window.location.pathname + currState.hashName);
            //}

            if (window.history) {
                window.history.back(); // will end up in the 'popstate' listener
            } else {
                const prevState = currState.prevState;
                window.location.hash = prevState.hashName + prevState.queryStr // fallback
            }
        }

        prepareNavigationMeta(meta) {
            meta = Object.assign({}, meta);
            const src = meta.sourceBlock;
            if (src && this.config.attractors.indexOf(src) > -1) {
                meta.attractToSourceBlock = true;
            }
            return meta;
        }

        doSaveScrollPos(stateObject, meta) {
            meta = meta || {};
            return ['forward', 'move'].includes(this.stateObject.stateName)
                && stateObject.isPopup && !stateObject.isModalPopup
                && !meta.attractToSourceBlock /*meta.sourceBlock !== '#order'*/
                && !Router.isManualNav(meta);
        }

        // history backwards button (i.e. "<") is pressed
        static isBackwards(meta) {
            return !!meta.history && meta.history.backwards;
        }
        // history forwards button (i.e. ">") is pressed
        static isForwards(meta) {
            return !!meta.history && !meta.history.backwards;
        }
        // any history nav button ("<" | ">") is pressed
        static isManualNav(meta) {
            return Router.isBackwards(meta) || Router.isForwards(meta);
        }

        // --- main functionality methods --------------------------------------

        processNavigation(stateObject, meta) {
            // NOTE: The 'stateObject' param holds the data relevant to a single
            //       state, while the 'meta' param holds the data for the whole
            //       transaction (and normally should be an immutable object).
            const params = stateObject || {
                hashName: '',
                queryStr: ''
            };

            // IMPORTANT: It DOES NOT support multi-page navigation yet!
            if (params.hashName.indexOf("#") > 0)
                params.hashName = '#' + params.hashName.split('#')[1];
            if (typeof params.queryStr === 'undefined')
                params.queryStr = '';
            log('processNavigation: %s', params.hashName);

            Router.retrievePopupIndicators(params);

            meta = this.prepareNavigationMeta(meta);
            this.addParamSpecificMeta(params, meta);

            // IMPORTANT: Stops hell lot of savage stuff here!
            //            Browser history navigation loops and
            //            endless popups opening triggering as
            //            well as inception navigation to '/'.
            if (params.hashName === this.stateObject.hashName) {
                if (Router.doNeedScrollToHash(params, this.stateObject, meta))
                    Router.scrollTo(Router.getScrollPos(params.hashName));
                return; // just scroll and do not process further
            }

            // NOTE: We have to double-close popups in some cases
            //       just in order to be able to normally process
            //       other cases (e.g. of newly opened popup URL)
            //       without being tied to the Tilda UI logic.
            if (this.stateObject.isPopup) {
                Router.closeAllOpenPopups();
            }

            if (params.isPopup) {
                Router.retrieveParentBlockInfo(params);
                params.stateName = 'popup';
                this.navToPopup(params, meta)
            } else /* =block */ {
                params.stateName = params.stateName || 'move';
                Router.addBlockMeta(this.stateObject, params, meta);
                this.navToBlock(params, meta)
            }
        }

        addParamSpecificMeta(params, meta) {
            if (!!meta.history) {
                meta.history.backwards =
                    (!!this.stateObject.prevState && !!params.timestamp
                        && this.stateObject.prevState.timestamp >= params.timestamp);
            }
        }
        static retrievePopupIndicators(params) {
            params.isProductPopup = params.hashName.substring(0, 3) === "#!/";
            params.isModalPopup = params.hashName.substring(0, 7) === '#popup:';
            params.isPopup = params.isProductPopup || params.isModalPopup;
        }
        static retrieveParentBlockInfo(params) {
            if (params.isProductPopup) {
                const ids = params.hashName.split(/[\/-]+/);
                params.product = {
                    recid: ids[2],
                    uid: ids[3]
                };
                const prevNavRec = $("#rec" + params.product.recid)
                    .find('[data-product-gen-uid="' + params.product.uid + '"]')
                    .parents('.t-rec').prevAll('[data-record-type="215"]').first();
                if (prevNavRec.length > 0) {
                    params.parentBlock = '#' + prevNavRec.find("a").attr("name");
                }
            }
            if (!params.parentBlock) {
                params.parentBlock = ''; // to avoid the '/undefined' in location
            }
        }

        static addBlockMeta(params, /* --> */ blockParams, meta) {
            meta.block = {
                doScrollToHash: Router.doNeedScrollToHash(params, blockParams, meta)
            };
            if (Router.isBackwards(meta)) {
                meta.block.prevStateScrollPos = params.prevState.scrollPos;
            }
            return meta;
        }
        doPersistForwardState(params, meta) {
            // NOTE: Persist the extra 'forward' nav state in case:
            //   1 - a non-modal (== product) popup is to be opened
            return params.isPopup && !params.isModalPopup
            //   2 - the popup's navigated outside the parent block
            //       or the attractor block ('prod_link' in 'Order')
                && ((!meta.attractToSourceBlock && params.parentBlock !== this.lastHashBeforePopup)
                    || (meta.attractToSourceBlock && meta.sourceBlock !== this.lastHashBeforePopup))
            //   3 - and user is not traversing the browser history
                && !Router.isManualNav(meta);
        }
        static doNeedScrollToHash(params, blockParams, meta) {
            // NOTE: Scrolls current block into the view only for:
            //   1 - navigation between blocks (product sections)
            return (!params.isModalPopup || Router.isForwards(meta))
                    && ['forward', 'move', 'init'].includes(blockParams.stateName)
            //   2 - popups URLs navigated directly, but not with
            //       usual page navigation means (hyper links) or
            //       the browser navigation buttons ("<" and ">")
                || (!params.isModalPopup && meta.isInitCall
                    /*this.stateObject.stateName === 'pre-init'*/);
        }
        static doImmediateScroll(params, meta) {
            return meta.isInitCall /*params.prevState.stateName === 'pre-init'*/
                || params.stateName === 'forward'; // fix for Safari jiggling
        }

        navToBlock(params, meta) {
            log('navToBlock: %s', params.hashName);
            this.switchNavState(params, meta);
            this.lastHashBeforePopup = params.hashName;

            // NOTE: The scrolling machinery is kept only here since
            //       we don't perform scrolling while popup is open.
            //       Also, an intra-block scroll position is used to
            //       make scrolling agnostic to "Show more" buttons
            //       press (relativize it).
            if (!!meta.block.doScrollToHash) {
                const intraScrollPos = meta.block.prevStateScrollPos || 0,
                    blockScrollPos = Router.getScrollPos(params.hashName),
                    immediate = Router.doImmediateScroll(params, meta);
                Router.scrollTo(blockScrollPos + intraScrollPos, immediate)
            }
        }
        navToPopup(params, meta) {
            log('navToPopup: %s', params.hashName);
            if (this.doPersistForwardState(params, meta)) {
                const blockMeta = Object.assign({}, meta),
                    blockParams = {
                        stateName: 'forward',
                        hashName: meta.sourceBlock || params.parentBlock
                    };
                Router.addBlockMeta(params, blockParams, blockMeta);
                this.navToBlock(blockParams, blockMeta)
            }

            this.switchNavState(params, meta);
            this.triggerPopupOpening(params, meta); // must go in the end
        }

        static closeAllOpenPopups() {
            log('closeAllOpenPopups');
            // IMPORTANT: First two do not open at the same time.
            if ($(".t-store .t-popup_show").length > 0) {
                t_store_closePopup(true);
            } else if ($(".t786 .t-popup_show").length > 0) {
                t786_closePopup(true);
            }
            if ($(".t390 .t-popup_show").length > 0) {
                t390_closePopup(true);
            }
        }
        triggerPopupOpening(params, meta) {
            let openLink = $();
            if (params.isProductPopup) {
                openLink = $("#rec" + params.product.recid)
                    .find('[data-product-gen-uid="' + params.product.uid + '"] [href^="#prodpopup"]')
            }
            if (params.isModalPopup) {
                openLink = $('a[href^="' + params.hashName + '"]').first()
            }
            if (meta.skipAnalytics) {
                openLink.attr('data-skip-analytics', 'true')
            }
            log('triggerPopupOpening: %s', openLink.attr('href'));
            if (meta.isInitCall) {
                setTimeout(function() {
                    openLink.trigger('click')
                }, 2000);
            } else {
                openLink.trigger('click')
            }
        }

        // --- public interface methods ----------------------------------------

        navigate(url, meta) {
            this.processNavigation({
                hashName: url,
                queryStr: ''
            }, meta)
        }
        navigateBack(meta) {
            this.goToPrevNavState(meta)
        }
    }
    window.TildaRouter = Router;

})(jQuery, window);
