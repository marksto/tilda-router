/* tilda-catalog-1.0.min.js */
function t_store_initPopup(t, e, r) {
    $("#rec" + t).find('[href^="#prodpopup"]').click(function(o) {
        o.preventDefault();
        var s = $(this).closest(".js-product").attr("data-product-gen-uid")
          , i = e[s];

        // new code block
        if ((r = window.location.href).indexOf("/tproduct/") < 0 && r.indexOf("%2Ftproduct%2F") < 0) {
            i.uid === window.tkLastOpenedProduct
                    ? (window.tkStopPopupRedraw = true)
                    : (window.tkLastOpenedProduct = i.uid);
            var pName = t_store_convertTextToUrlSlug(i.title);
            window.router.navigate("#!/tproduct/" + t + "-" + i.uid + "-" + pName);
            return false;
        }

        t_store_openProductPopup(t, r, i, $(this))
    }),
    r.isPublishedPage && setTimeout(function() {
        t_store_checkUrl(r, t)
    }, 300),
    t_store_copyTypographyFromLeadToPopup(t)
}
function t_store_openProductPopup(t, e, r, $link /* new arg */) {
    var o = $("#rec" + t).find(".t-popup");
    !window.tkStopPopupRedraw && t_store_drawProdPopup(t, o, r, e), /* line modified */
    t_store_showPopup(t);
    if ($link && $link.attr('data-skip-analytics') !== 'true') { /* new line */
        var s = o.attr("data-track-popup");
        if (s > "") {
            var i = r.title;
            i && (i = i + " " + tkProdCatMap["rec" + t].name),
            i || (i = "prod" + r.uid),
            Tilda.sendEventToStatistics(s, i)
        }
    }; $link && $link.attr('data-skip-analytics', 'false'); /* new line */
    //e.isPublishedPage && t_store_changeUrl(t, r),
    t_slds_updateSlider(t)
}
function t_store_showPopup(t) {
    var e = $("#rec" + t)
      , r = e.find(".t-popup");
    r.css("display", "block"),
    setTimeout(function() {
        r.find(".t-popup__container").addClass("t-popup__container-animated"),
        r.addClass("t-popup_show"),
        "y" == window.lazy && t_lazyload_update()
    }, 50),
    $("body").addClass("t-body_popupshowed"),
    // IMPORTANT: new line for each handler: 'on' -> 'one'!
    e.find(".t-popup").one('click', function(t) {
        if (t.target == this) {
            t.stopImmediatePropagation(); /* new line */
            t_store_closePopup()
        }
    }),
    e.find(".t-popup__close, .js-store-close-text").one('click', function(t) {
        t.stopImmediatePropagation(); /* new line */
        t_store_closePopup()
    }),
    $(document).one('keydown', function(t) {
        27 == t.keyCode && t_store_closePopup()
    })
}
function t_store_closePopup(doNotGoBack /* new arg */) {
    // IMPORTANT: Added here, before removing the class 't-body_popupshowed'.
    if (!doNotGoBack) window.router.navigateBack();

    $("body").removeClass("t-body_popupshowed"),
    $(".t-popup").removeClass("t-popup_show");

    // the routing logic is extracted out of here
    //var t = window.location.href
    //  , e = t.indexOf("/tproduct/");
    ///iPhone|iPad|iPod/i.test(navigator.userAgent) && e < 0 && (e = t.indexOf("/tproduct/")) < 0 && (e = t.indexOf("%2Ftproduct%2F")),

    setTimeout(function() {
        $(".t-popup").scrollTop(0),
        $(".t-popup").not(".t-popup_show").css("display", "none");

        // the routing logic is extracted out of here
        //void 0 !== history.replaceState && -1 !== e && (t = t.substring(0, e),
        //window.history.replaceState("", "", t))
    }, 300)
}