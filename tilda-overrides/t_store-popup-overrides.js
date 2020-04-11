/* tilda-catalog-1.1.min.js */
function t_store_get_productCard_onePrice_html(t, e, r, o) {
    var startingPrice = getStartingPrice(t); /* new line */
    var s = "current" === o ? startingPrice || e.price : e.priceold /* line modified */
      , i = "current" === o ? "price" : "priceold";
    if ("current" !== o && (!s || "0" === s)) /* line modified */
        return "";
    var a, d = "", n = "current" === o ? "t-store__card__price" : "t-store__card__price_old", l = "", _ = "current" === o ? r.price.color : r.price.colorOld;
    l += _ ? "color:" + _ + ";" : "",
    l += r.price.fontSize ? "font-size:" + r.price.fontSize + ";" : "",
    a = "" !== (l += r.price.fontWeight ? "font-weight:" + r.price.fontWeight + ";" : "") ? 'style = "' + l + '"' : "";
    var c = 1 === t.editions.length ? 'field="st_' + i + "__" + e.uid + '" data-redactor-toolbar="no"' : ""
      , p = r.currencyTxt ? '<div class="t-store__card__price-currency">' + r.currencyTxt + "</div>" : ""
      , u = "current" === o ? "js-product-price js-store-prod-price-val" : "js-store-prod-price-old-val";
    return d += '<div class="' + n + ' t-store__card__price-item t-name t-name_xs" ' + a + ">",
    d += "    " + ("r" !== r.currencySide && p ? p : ""),
    d += '    <div class="' + u + ' t-store__card__price-value" ' + c + ">" + s + "</div>",
    d += "    " + ("r" === r.currencySide && p ? p : ""),
    d += "</div>"
}

function t_store_initPopup(o, s, i, a, n) {
    for (var t in s) {
        var e = $("#rec" + o)
          , r = (a ? e.find(".js-product-relevant[data-product-gen-uid=" + t + "]") : e.find("[data-product-gen-uid=" + t + "]")).find('[href^="#prodpopup"]');
        r.unbind(),
        a || window.localStorage.setItem("urlBeforePopupOpen", window.location.href),
        r.click(function(t) {
            t.preventDefault();
            var e = $(this).closest(".js-product").attr("data-product-gen-uid")
              , r = s[e];

            // new code block
            if (!isProductPopupOpened()) {
                r.uid === window.tkLastOpenedProduct
                        ? (window.tkStopPopupRedraw = true)
                        : (window.tkLastOpenedProduct = r.uid);
                var pName = t_store_convertTextToUrlSlug(r.title);
                window.router.navigate("#!/tproduct/" + o + "-" + r.uid + "-" + pName);
                return false;
            }

            "" == n.header && "" == n.footer || !n.disablepopup ? t_store_openProductPopup(o, i, r, a, !1, !!a, $(this)) : location.href = r.url
        }),
        i.isPublishedPage && setTimeout(function() {
            t_store_checkUrl(i, o)
        }, 300),
        t_store_copyTypographyFromLeadToPopup(o)
    }
}
function t_store_openProductPopup(t, e, r, o, s, i, $link /* new arg */) {
    var a = $.contains($("#allrecords")[0], $(".t-store__product-snippet")[0]);
    a || t_store_open_popup_routing_init(t, e);
    var n = e.showRelevants
      , l = $("#rec" + t).find(".t-popup");
    !window.tkStopPopupRedraw && t_store_drawProdPopup(t, l, r, e, i), /* line modified */
    t_store_showPopup(t, s, i);
    if ($link && $link.attr('data-skip-analytics') !== 'true') { /* new line */
        var d = l.attr("data-track-popup");
        if ("" < d) {
            var _ = r.title;
            _ = _ || "prod" + r.uid;
            try {
                Tilda && "function" == typeof Tilda.sendEcommerceEvent ? Tilda.sendEcommerceEvent("detail", [{
                    id: "" + (r.id ? r.id : r.uid),
                    uid: "" + r.uid,
                    price: "" + (r.price_min ? r.price_min : r.price),
                    sku: r.sku ? r.sku : "",
                    name: r.title
                }]) : Tilda.sendEventToStatistics(d, _)
            } catch (t) {
                Tilda.sendEventToStatistics(d, _)
            }
        }
    }; $link && $link.attr('data-skip-analytics', 'false'); /* new line */
    if (//e.isPublishedPage && !s && t_store_changeUrl(t, r, o, e),
    t_slds_updateSlider(t),
    n && !a) {
        var c = "cc" === e.showRelevants ? "current_category" : "all_categories"
          , p = e.relevants_quantity || 4;
        t_store_loadProducts("relevants", t, e, !1, {
            currentProductUid: r.uid,
            relevantsQuantity: p,
            relevantsMethod: c,
            relevantsSort: "random"
        })
    }
    "y" == window.lazy && t_store_popup_updLazyOnScroll(t),
    t_store_init_popups(t);

    // new code block — re-select the featured variant when popup is opened
    if (!window.tkStopPopupRedraw) {
        reselectFeaturedVariant(l)
    }
    window.tkStopPopupRedraw = false;
}
function t_store_drawProdPopup(t, e, r, o, s) {
    var i = e.find(".js-product");
    i.data("cardSize", "large"),
    t_store_drawProdPopup_drawGallery(t, e, r, o),
    e.find(".js-store-product").attr("data-product-lid", r.uid).attr("data-product-uid", r.uid).attr("data-product-gen-uid", r.uid),
    r.title ? e.find(".js-store-prod-name").html(r.title).show() : e.find(".js-store-prod-name").html("").hide(),
    t_store_drawTextAndCharacteristics(e, r),
    t_store_addProductOptions(t, r, i, o),
    t_prod__initProduct(t, i),
    s && $(window).unbind("resize", window.t_store_prodPopup_updateGalleryThumbsEvent),
    window.t_store_prodPopup_updateGalleryThumbsEvent = function() {
        t_store_prodPopup_updateGalleryThumbs(t, e, r, o)
    },
    $(window).bind("resize", window.t_store_prodPopup_updateGalleryThumbsEvent),
    redrawProdPopup(t) /* new line */
}

function t_store_showPopup(t, e, r) {
    var o = $("#rec" + t)
      , s = o.find(".t-popup");
    s.css("display", "block"),
    setTimeout(function() {
        s.find(".t-popup__container").addClass("t-popup__container-animated"),
        s.addClass("t-popup_show"),
        "y" == window.lazy && t_lazyload_update()
    }, 50),
    $("body").addClass("t-body_popupshowed"),
    r || addPopupEvents(o, t)
}
function addPopupEvents(t) {
    // IMPORTANT: new line for each handler: 'on' -> 'one'!
    t.find(".t-popup").one('click', function(t) {
        if (t.target == this) {
            t.stopImmediatePropagation(); /* new line */
            t_store_closePopup(!1)
        }
    }),
    t.find(".t-popup__close, .js-store-close-text").one('click', function(t) {
        t.stopImmediatePropagation(); /* new line */
        t_store_closePopup(!1)
    }),
    $(document).one('keydown', function(t) {
        27 == t.keyCode && t_store_closePopup(!1)
    })
}
function t_store_closePopup(t, e, r, doNotGoBack /* new arg */) {
    // IMPORTANT: Added here, before removing the class 't-body_popupshowed'.
    if (!doNotGoBack) window.router.navigateBack();

    var o, s, i, a;
    if ($.contains($("#allrecords")[0], $(".t-store__product-snippet")[0]) || t_store_closePopup_routing(),
    $("body").removeClass("t-body_popupshowed"),
    $(".t-popup").removeClass("t-popup_show"),
    t)
        if (t_store_isQueryInAddressBar("tstore")) {
            var n, l = decodeURI(window.location.hash).split("/"), d = l.indexOf("c") + 1, _ = l.indexOf("r") + 1;
            n = l[_],
            o = -1 != l[d].indexOf("-") ? l[d].slice(0, l[d].indexOf("-")) : l[d],
            t_store_isStorepartFromHistoryActive((s = window.history.state.opts).storepart = o, e, r) || t_store_loadProducts("", n, s)
        } else
            t_store_isStorepartFromHistoryActive(r.storepart, e, r) || t_store_loadProducts("", e, r);
    // the routing logic is extracted out of here
    //else
        //window.history.state && window.history.state.productData && (a = window.localStorage.getItem("urlBeforePopupOpen"),
        //t_store_history_pushState({
        //    storepartuid: o = (i = window.history.state.productData).opts.storepart,
        //    opts: r = i.opts,
        //    recid: e = i.recid
        //}, null, a));
    t_store_setActiveStorePart(e, r),
    setTimeout(function() {
        $(".t-popup").scrollTop(0),
        $(".t-popup").not(".t-popup_show").css("display", "none");
    }, 300);
    var c = $("#rec" + e + " .t-popup");
    0 != c.length && c.unbind("scroll"),
    $(document).unbind("keydown"),
    $(window).unbind("resize", window.t_store_prodPopup_updateGalleryThumbsEvent)
}

function t_store_drawProdPopup_drawGallery(t, e, r, s) {
    var i, o = $("#rec" + t);
    if (r.gallery)
        if (0 !== (i = "string" == typeof r.gallery ? jQuery.parseJSON(r.gallery) : r.gallery).length) {
            var a, n, l = t_store_get_productcard_slider_html(o, s), d = "", _ = "", c = "thumbs" === s.slider_opts.controls || "arrowsthumbs" === s.slider_opts.controls || "dots" === s.slider_opts.controls || "" === s.slider_opts.controls, p = "thumbs" === s.slider_opts.controls || "arrowsthumbs" === s.slider_opts.controls, u = parseInt(s.popup_opts.columns, 10), f = +s.slider_slidesOpts.ratio;
            $.each(i, function(t, e) {
                var r = t_store_get_productcard_oneSlide_html(s);
                if (d += r.replace("[[activeClass]]", 0 === t ? "t-slds__item_active" : "").replace("[[productClass]]", 0 === t ? "js-product-img" : "").replace(/\[\[index\]\]/g, t + 1).replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(s, e.img)).replace(/\[\[imgsource\]\]/g, e.img),
                c)
                    if (p && "l" == s.sliderthumbsside) {
                        var o = t_store_prodPopup_gallery_calcMaxThumbsCount(u, f, 60, 10);
                        t <= o - 1 && (n = (a = t <= o - 2 || t === i.length - 1 ? t_store_get_productcard_oneSliderBullet_html(s) : t_store_get_productcard_thumbsGallery_html(s, i.length, o)).replace("[[activeClass]]", 0 === t ? "t-slds__bullet_active" : "").replace(/\[\[index\]\]/g, t + 1).replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(s, e.img)).replace(/\[\[imgsource\]\]/g, e.img),
                        _ += n)
                    } else
                        a = t_store_get_productcard_oneSliderBullet_html(s),
                        n = a.replace("[[activeClass]]", 0 === t ? "t-slds__bullet_active" : "").replace(/\[\[index\]\]/g, t + 1).replace(/\[\[imgsource_lazy\]\]/g, t_store_getLazyUrl(s, e.img)).replace(/\[\[imgsource\]\]/g, e.img),
                        _ += n
            }),
            l = l.replace("[[slides]]", d),
            c && (l = l.replace("[[bullets]]", _)),
            e.find(".js-store-prod-slider").html(l);
            var h, v = ".t-slds__arrow_container, .t-slds__bullet_wrapper, .t-slds__thumbsbullet-wrapper";
            if (1 === i.length ? e.find(v).hide() : e.find(v).show(),
            !0 !== window.tzoominited)
                try {
                    t_initZoom()
                } catch (t) {
                    console.log(t.message)
                }
            "l" == s.sliderthumbsside && (h = {
                thumbsbulletGallery: !0,
                storeOptions: s
            })
            /*t_sldsInit(t + " .js-store-product", h)*/ /* postponed till the 't_store_product_updateEdition' */
        } else
            e.find(".js-store-prod-slider").html("")
}
function t_store_product_initEditions(n, l, d, _) {
    var t = d.find(".js-product-controls-wrapper");
    t_store_product_addEditionControls(l, t, _),
    t_store_product_selectAvailableEdition(n, l, d, _, null, true /* new args */) ? (t_store_product_triggerSoldOutMsg(d, !1, _),
    t_store_product_disableUnavailOpts(d, l)) : t_store_product_triggerSoldOutMsg(d, !0, _),
    d.find(".js-product-edition-option").on("change", function() {
        var t = t_store_product_detectEditionByControls(d, l);
        if (t) {
            t_store_product_updateEdition(n, d, t, l),
            t_prod__updatePrice(n, d);
            var e = parseInt(t.quantity, 10) <= 0;
            t_store_product_triggerSoldOutMsg(d, e, _)
        } else {
            for (var r = $(this).attr("data-edition-option-id"), o = [], s = 0; s < l.editionOptions.length; s++) {
                var i = l.editionOptions[s];
                if (o.push(i),
                i.name === r)
                    break
            }
            var a = t_store_product_selectAvailableEdition(n, l, d, _, o);
            t_prod__updatePrice(n, d),
            t_store_product_triggerSoldOutMsg(d, !a, _)
        }
        d.find(".js-product-edition-option-variants option").removeAttr("disabled"),
        t_store_product_disableUnavailOpts(d, l)
    })
}
function t_store_product_selectAvailableEdition(t, e, r, o, s, firstOpening /* new arg */) {
    // TODO: Fix the old size selection on browser navigation via page history buttons.
    var oldSize = t_store_product_getCurEditionOptValByName(r, '_size'); /* new line */
    var i = s && 0 < s.length ? t_store_product_getFirstAvailableEditionData_forCertainVals(e.editions, s, r, oldSize)
            : t_store_product_getFirstAvailableEditionData(e.editions); /* line modified */
    if (!i)
        return console.log("No available edition for uid = " + e.uid + " with selected options values"),
        !1;
    var a = 0 !== parseInt(i.quantity, 10);
    return e.editionOptions.forEach(function(t) {
        var e = i[t.name];
        t_store_product_getEditionSelectEl(r, t).find(".js-product-edition-option-variants").val(e)
    }),
    t_store_product_updateEdition(t, r, i, e, firstOpening /* new arg */, getStartingPrice(e) /* new arg */),
    a
}
function t_store_product_getFirstAvailableEditionData_forCertainVals(t, e, r, oldSize /* newArg */) {
    for (var o = "", s = 0; s < t.length; s++) {
        for (var i = t[s], a = !0, n = 0; n < e.length; n++) {
            var l = e[n].name
              , d = t_store_product_getCurEditionOptValByName(r, l);
            if (i[l] !== d || i['_size'] !== oldSize) { /* line modified */
                a = !1;
                break
            }
        }
        if (a) {
            if (0 !== parseInt(i.quantity, 10))
                return i;
            o = o || i
        }
    }
    return o
}
function t_store_product_disableUnavailOpts(t, o) {
    var editables = o.editionOptions.filter(function(el) { return !el.name.startsWith('_'); }); /* new line */
    for (var e = 1; e < editables.length; e++) { /* line modified */
        var s = editables[e] /* line modified */
          , i = t_store_product_getEditionSelectEl(t, s)
          , a = editables[e - 1] /* line modified */
          , n = t_store_product_getEditionSelectEl(t, a).find(".js-product-edition-option-variants").val();
        s.values.forEach(function(t) {
            var e = t_store_product_disableUnavailOpts_checkEdtn(o, s, t, a, n)
              , r = i.find('option[value="' + t + '"]');
            e ? r.removeAttr("disabled") : r.attr("disabled", "disabled")
        });
        disabledOrEnableEdition(i, i.find('option:not([disabled])').length < 2); /* new line */
    }

    // new code block
    var ss = t_store_product_getEditionSelectEl(t, editables[0]);
    disabledOrEnableEdition(ss, ss.find('option:not([disabled])').length < 2);
    addColorsToColorfulOptions(t);
    addPriceDisclaimer(t);
}
function t_store_product_updateEdition(t, e, r, o, firstOpening /* new arg */, startingPrice /* new arg */) {
    var price = !!firstOpening ? (startingPrice || r.price) : r.price; /* new line */
    if (price && 0 !== parseFloat(price)) { /* line modified */
        var s = t_store__getFormattedPrice(price); /* line modified */
        e.find(".js-store-prod-price").show(),
        e.find(".js-store-prod-price-val").html(s);
        var i = t_prod__cleanPrice(price); /* line modified */
        e.find(".js-product-price").attr("data-product-price-def", i),
        e.find(".js-product-price").attr("data-product-price-def-str", i)
    } else
        e.find(".js-store-prod-price").hide(),
        e.find(".js-store-prod-price-val").html(""),
        e.find(".js-product-price").attr("data-product-price-def", ""),
        e.find(".js-product-price").attr("data-product-price-def-str", "");
    if (r.priceold && "0" !== r.priceold) {
        var a = t_store__getFormattedPrice(r.priceold);
        e.find(".js-store-prod-price-old").show(),
        e.find(".js-store-prod-price-old-val").html(a)
    } else
        e.find(".js-store-prod-price-old").hide(),
        e.find(".js-store-prod-price-old-val").html("");
    o.brand && e.find(".t-store__prod-popup__brand").html(o.brand + " ");
    var n = e.find(".t-store__prod-popup__sku")
      , l = e.find(".js-store-prod-sku");

    // new code block
    var newColorCode = getColorCode(r.img);
    var currImage = e.find('.t-slds__item_active meta').attr('content');
    var moveSlider = firstOpening || !currImage || getColorCode(currImage) !== newColorCode;
    if (moveSlider) {
        setTimeout(function() {
            filterSlides(t + " .js-store-product", newColorCode); /* calls 't_sldsInit' only here */
        }, !!firstOpening ? 500 : 0)
    }

    if (r.sku ? (l.html(r.sku),
    "large" === e.data("cardSize") && (l.show(),
    n.show())) : (l.html("").hide(),
    n.hide()),
    e.attr("data-product-inv", r.quantity),
    e.attr("data-product-lid", r.uid).attr("data-product-uid", r.uid),
    r.img)
        e.attr("data-product-img", r.img),
        "large" === e.data("cardSize") && moveSlider && t_store_product_updateEdition_moveSlider(t, e, r); /* line modified */
    else {
        var d = e.attr("data-product-img");
        void 0 !== d && "" !== d && "large" === e.data("cardSize") && moveSlider && (t_store_product_updateEdition_moveSlider(t, e, r), /* line modified */
        e.attr("data-product-img", ""))
    }
}

function t_store_convertTextToUrlSlug(t) {
    return t.replace(/\s+/g, "-"); /* throw away all unnecessary Tilda-specific logic */
}

// NOTE: These new features are already included into the Router which is a more feature-rich and mature solution.
function t_store_initRouting() {
    // window.onpopstate = function() {
    //     if (window.history.state && window.history.state.productData) {
    //         var t = window.history.state.productData;
    //         t_store_openProductPopup(t.recid, t.opts, t.productObj, t.isRelevantsShow)
    //     }
    // }
}
function t_store_open_popup_routing_init(e, r) {
    // window.onpopstate = function() {
    //     if (window.history.state)
    //         if (window.history.state.productData) {
    //             var t = window.history.state.productData;
    //             t_store_openProductPopup(t.recid, t.opts, t.productObj, t.isRelevantsShow, !0)
    //         } else
    //             t_store_closePopup(!0, e, r);
    //     else
    //         t_store_closePopup(!0, e, r)
    // }
}
function t_store_closePopup_routing() {
    // window.onpopstate = function() {
    //     if (window.history.state) {
    //         if (window.history.state.productData) {
    //             var t = window.history.state.productData
    //               , e = t.recid
    //               , r = t.opts;
    //             t_store_openProductPopup(e, r, t.productObj, t.isRelevantsShow, !0)
    //         }
    //         if (window.history.state.storepartuid) {
    //             var o = window.history.state.opts
    //               , s = window.history.state.recid;
    //             r.isPublishedPage = !0,
    //             t_store_loadProducts("", s, o)
    //         }
    //     }
    // }
}
