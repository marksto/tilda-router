function t786_initPopup(recid) {
    var rec = $('#rec' + recid);
    rec.find('[href^="#prodpopup"]').one("click", function(e) {
        e.preventDefault();
        var el_popup = rec.find('.t-popup');
        var el_prod = $(this).closest('.js-product');
        var lid_prod = el_prod.attr('data-product-lid');
        t_sldsInit(recid + ' #t786__product-' + lid_prod + '')
    });
    rec.find('[href^="#prodpopup"]').click(function(e) {
        e.preventDefault();
        t786_showPopup(recid);
        var el_popup = rec.find('.t-popup');
        var el_prod = $(this).closest('.js-product');
        var lid_prod = el_prod.attr('data-product-lid');
        el_popup.find('.js-product').css('display', 'none');
        var el_fullprod = el_popup.find('.js-product[data-product-lid="' + lid_prod + '"]');
        el_fullprod.css('display', 'block');

        if ($(this).attr('data-ignore-change-event') !== 'true') { /* new line */
            var analitics = el_popup.attr('data-track-popup');
            if (analitics > '') {
                var virtTitle = el_fullprod.find('.js-product-name').text();
                if (!virtTitle) {
                    virtTitle = 'prod' + lid_prod
                }
                Tilda.sendEventToStatistics(analitics, virtTitle)
            }
        }; $(this).attr('data-ignore-change-event', 'false') /* new line */

        //var curUrl = window.location.href;
        //if (curUrl.indexOf('#!/tproduct/') < 0 && curUrl.indexOf('%23!/tproduct/') < 0) {
            // moved into a separate method and called later conditionally
            //if (typeof history.pushState != 'undefined') {
            //    window.history.pushState('popup', '', window.location.href)
            //}
            window.router.navigate('#!/tproduct/' + recid + '-' + lid_prod); /* new line */
        //}
        t786_updateSlider(recid + ' #t786__product-' + lid_prod + '');
        if (window.lazy == 'y') {
            t_lazyload_update()
        }
    });
    if ($('#record' + recid).length == 0) {
        t786_checkUrl(recid)
    }
    t786_copyTypography(recid)
}
function t786_showPopup(recid) {
    var el = $('#rec' + recid);
    var popup = el.find('.t-popup');
    popup.css('display', 'block');
    setTimeout(function() {
        popup.find('.t-popup__container').addClass('t-popup__container-animated');
        popup.addClass('t-popup_show');
        if (window.lazy == 'y') {
            t_lazyload_update()
        }
    }, 50);
    $('body').addClass('t-body_popupshowed');

    // IMPORTANT: new line for each handler: 'on' -> 'one'!
    el.find('.t-popup').one('click', function(e) {
        if (e.target == this) {
            e.stopImmediatePropagation(); /* new line */
            t786_closePopup()
        }
    });
    el.find('.t-popup__close, .t786__close-text').one('click', function(e) {
        e.stopImmediatePropagation(); /* new line */
        t786_closePopup()
    });
    $(document).one('keydown', function(e) {
        if (e.keyCode == 27) {
            t786_closePopup()
        }
    })
}
function t786_closePopup(doNotGoBack /* new arg */) {
    // IMPORTANT: Added here, before removing the class 't-body_popupshowed'.
    if (!doNotGoBack) window.router.navigateBack();

    $('body').removeClass('t-body_popupshowed');
    $('.t-popup').removeClass('t-popup_show');
    
    // the routing logic is extracted out of here
    //var curUrl = window.location.href;
    //var indexToRemove = curUrl.indexOf('#!/tproduct/');
    //if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && indexToRemove < 0) {
    //    indexToRemove = curUrl.indexOf('%23!/tproduct/')
    //}
    //curUrl = curUrl.substring(0, indexToRemove);

    setTimeout(function() {
        $(".t-popup").scrollTop(0);
        $('.t-popup').not('.t-popup_show').css('display', 'none');
        // the routing logic is extracted out of here
        //if (typeof history.replaceState != 'undefined') {
        //    window.history.replaceState('', '', curUrl)
        //}
    }, 300)
}