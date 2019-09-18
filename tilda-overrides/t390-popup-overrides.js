/* tilda-blocks-2.7.js */
function t390_initPopup(recid) {
    $('#rec' + recid).attr('data-animationappear', 'off');
    $('#rec' + recid).css('opacity', '1');
    var el = $('#rec' + recid).find('.t-popup')
      , hook = el.attr('data-tooltip-hook')
      , analitics = el.attr('data-track-popup');
    if (hook !== '') {
        $('.r').on('click', 'a[href="' + hook + '"]', function(e) {
            e.preventDefault(); // moved here
            t390_showPopup(recid);
            t390_resizePopup(recid);

            window.router.navigate(hook); /* new line */

            //e.preventDefault();
            if (window.lazy == 'y') {
                t_lazyload_update()
            }

            if ($(this).attr('data-skip-analytics') !== 'true') { /* new line */
                if (analitics > '') {
                    var virtTitle = hook;
                    if (virtTitle.substring(0, 7) == '#popup:') {
                        virtTitle = virtTitle.substring(7)
                    }
                    Tilda.sendEventToStatistics(analitics, virtTitle)
                }
            }; $(this).attr('data-skip-analytics', 'false') /* new line */
        })
    }
}
function t390_showPopup(recid) {
    var el = $('#rec' + recid)
      , popup = el.find('.t-popup');
    popup.css('display', 'block');
    setTimeout(function() {
        popup.find('.t-popup__container').addClass('t-popup__container-animated');
        popup.addClass('t-popup_show')
    }, 50);
    $('body').addClass('t-body_popupshowed');

    // IMPORTANT: new line for each handler: 'on' -> 'one'!
    el.find('.t-popup').one('click', function(e) {
        if (e.target == this) {
            e.stopImmediatePropagation(); /* new line */
            t390_closePopup()
        }
    });
    el.find('.t-popup__close').one('click', function(e) {
        e.stopImmediatePropagation(); /* new line */
        t390_closePopup()
    });
    el.find('a[href*=#]').one('click', function(e) {
        var url = $(this).attr('href');

        // new code block — let's work this case out!
        var isNavToPopup = url.indexOf('#popup:') > -1;
        if (isNavToPopup) {
            e.preventDefault();
        }
        if (!window.location.href.endsWith(url)) {
            t390_closePopup(true, isNavToPopup);
        }

        //if (!url || url.substring(0, 7) != '#price:') {
            //t390_closePopup();
            //if (!url || url.substring(0, 7) == '#popup:') {
            //    setTimeout(function() {
            //        $('body').addClass('t-body_popupshowed')
            //    }, 300)
            //}
        //}
    });
    $(document).one('keydown', function(e) {
        if (e.keyCode == 27) {
            t390_closePopup()
        }
    })
}
function t390_closePopup(doNotGoBack, doQuickHide /* new args */) {
    // IMPORTANT: Added here, before removing the class 't-body_popupshowed'.
    if (!doNotGoBack) window.router.navigateBack();

    $('body').removeClass('t-body_popupshowed');
    $('.t-popup').removeClass('t-popup_show');
    //setTimeout(function() {
    //    $('.t-popup').not('.t-popup_show').css('display', 'none');
    //}, 300)
    
    // new code block — with more precise logic
    if (doQuickHide) {
        // NOTE: This is the case of opening another popup URL from a popup.
        $('.t-popup').not('.t-popup_show').css('display', 'none');
    } else {
        setTimeout(function() {
            $('.t-popup').not('.t-popup_show').css('display', 'none');
        }, 300)
    }
}