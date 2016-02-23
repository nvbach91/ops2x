
App.getWindowWidth = function () {
    return window.innerWidth;
}
;
App.getAnimationTime = function () {
    return App.getWindowWidth() > 799 ? 100 : 0;
}
;

Array.prototype.binaryIndexOf = function (searchElement) {
    'use strict';

    var minIndex = 0;
    var maxIndex = this.length - 1;
    var currentIndex;
    var currentElement;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = this[currentIndex];

        if (currentElement < searchElement) {
            minIndex = currentIndex + 1;
        }
        else if (currentElement > searchElement) {
            maxIndex = currentIndex - 1;
        }
        else {
            return currentIndex;
        }
    }

    return -1;
};

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

Number.prototype.formatMoney = function (c, d, t) {
    var n = this,
            c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d === undefined ? "." : d,
            t = t === undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}
;

App.beep = function () {
    var b = document.getElementById("beep");
    b.pause();
    b.currentTime = 0;
    b.play();
}
;

App.correctPrice = function (pr) {
    var p = pr.replace(/\./g, "");
    var correctValue = "";
    while (p.length > 2 && p.charAt(0) === "0") {
        p = p.slice(1);
    }
    if (parseInt(p) === 0) {
        return false;
    }
    if (p.length > 2) {
        correctValue = p.slice(0, p.length - 2) + "." + p.slice(p.length - 2, p.length);
    } else if (p.length > 1) {
        correctValue = "0." + p;
    } else if (p.length > 0) {
        correctValue = "0.0" + p;
    }
    return correctValue;
}
;

App.recalculateTotalCost = function () {
    var saleList = $("#sale-list");
    if (saleList.children().size() === 1) {
        $("#si-placeholder").removeClass("hidden");
    }
    var totalCost = 0;
    var itemsCnt = 0;
    saleList.find(".sale-item").each(function () {
        var si = $(this);
        var q = parseInt(si.find(".si-quantity").val());
        itemsCnt += q;
        var p = parseFloat(si.find(".si-price").text());
        var subTotal = p * q;
        var discountPercent = si.find(".d-discount").val() / 100;
        subTotal = subTotal - subTotal * discountPercent;
        subTotal.toFixed(2);
        si.find(".si-total").text(subTotal.formatMoney(2, ".", ""));
    });
    saleList.find(".sale-item .si-total").each(function () {
        totalCost += parseFloat($(this).text());
    });
    totalCost.toFixed(2);
    var totalCostText = totalCost.formatMoney(2, ".", " ");
    $("#checkout-total").text("Total: " + totalCostText + " Kč");
    $("#pay-amount").text(totalCostText + " Kč");
    $("#checkout-label").text("CHECKOUT (" + itemsCnt + " item" + (itemsCnt !== 1 ? "s" : "") + ")");
}
;

App.checkPriceInput = function (e, kc, p) {
    e.stopPropagation();
    kc.text("keyCode: " + e.keyCode);
    //var p = $("#price-input");
    if (e.keyCode === 13) { // allow enter 
        if (p.val().length) {
            p.blur();
        }
        return true;
    }
    if (e.keyCode === 8 || e.keyCode === 9) { //allow backspace)
        return true;
    }
    if (e.keyCode === 109 || e.keyCode === 189 || e.keyCode === 173) { // check for multiple dashes
        if (p.val().length > 0) {
            return false;
        }
        return true;
        /*var q = p.val();
         return p.val().indexOf("-") < 0;*/
    }
    if (e.keyCode === 229) { // disable mobile unknown keys, not working?
        return false;
    }
    // allow asterisk for scanner multiplication
    // do not allow more than 99*
    if (e.keyCode === 106) {
        if (p.val().length === 0 || p.val().length > 2) {
            return false;
        }
        if (p.val().indexOf("*") < 0) {
            //p.attr("maxlength", 9);
            return true;
        }
        return false;
    }
    // prevent non-digit key press
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
};

App.checkNumericInput = function (e, t) {
    if (e.keyCode === 13) { // allow enter and blur upon press
        t.blur();
        return true;
    }
    if (e.keyCode === 8) { //allow backspace
        return true;
    }

    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
};

App.setUpMobileNumericInput = function (jpi) {
    if($.browser.mobile) {        
        jpi.attr("type", "number");
    }
};

App.showInCurtain = function (s) {
    var curtain = $("<div>").attr("id", "curtain").click(function () {
        $(this).fadeOut(App.getAnimationTime(), function () {
            $(this).remove();
        });
    });
    curtain.append(s).hide();
    $("#app").append(curtain);
    curtain.fadeIn(App.getAnimationTime());
}
;

App.getMultiplicationNumber = function (jpi) {
    var m = jpi.val().replace(/[\s\.]+/g, "");
    if (!m.match(/^\-?[1-9](\d+)?\*(\d+)?$/g)) {
        return 1;
    }
    return parseInt(m.slice(0, m.indexOf("*")));
}
;

App.addItemToCheckout = function (id, ean, name, price, group, tax, tags, desc, mult) {
    var jSaleList = $("#sale-list");
    var lastItem = jSaleList.find(".sale-item.last");
    if (id.toString() === lastItem.find(".si-id").text()) {
        if ($("#registry-session").text() === "1") {
            App.incrementLastItem(lastItem);
            return true;
        }
    }
    var jSaleListPlaceHolder = jSaleList.find("#si-placeholder");
    if (jSaleListPlaceHolder.size()) {
        jSaleListPlaceHolder.addClass("hidden");
    }
    if (jSaleList.children().size() > 0) {
        jSaleList.children().eq(jSaleList.children().size() - 1).removeClass("last");
    }
    // creating sale item and bind events
    var item = $("<li>").addClass("sale-item last");
    var main = $("<div>").addClass("sale-item-main");
    $("<div>").addClass("si-id").text(id).appendTo(main);
    $("<div>").addClass("si-ean").text(ean).appendTo(main);
    $("<div>").addClass("si-name").text(name).appendTo(main);
    $("<input>")
            .addClass("si-quantity")
            .attr({maxlength: 3})
            .val(mult ? mult : 1)
            .keydown(function (e) {
                return App.checkNumericInput(e, this);
            })
            .focus(function () {
                $(this).select();
            })
            .blur(function () {
                if (!$(this).val()) {
                    ($(this).val(0));
                }
                App.recalculateTotalCost();
            })
            .appendTo(main);
    $("<div>").addClass("si-price").text(price).appendTo(main);
    $("<div>").addClass("si-total").text(price).appendTo(main);
    $("<button>")
            .addClass("si-remove")
            .click(function () {
                $(this).parent().parent().slideUp(App.getAnimationTime(), function () {
                    $(this).remove();
                    App.recalculateTotalCost();
                });
            })
            .appendTo(main);
    main.children(".si-name, .si-price, .si-total").click(function () {
        $(this).parent().parent().find(".sale-item-extend")
                .slideToggle(App.getAnimationTime(), function () {
                    var t = $(this);
                    if (t.is(":hidden")) {
                        t.parent().removeClass("expanded");
                    } else {
                        t.parent().addClass("expanded");
                    }
                });
    });
    main.appendTo(item);
    var details = $("<div>").addClass("sale-item-extend");

    var individualPrice = $("<div>").addClass("change-price");
    $("<div>").addClass("d-label").text("Individual Price").appendTo(individualPrice);
    $("<input>")
            .addClass("d-price")
            .attr({maxlength: 7, placeholder: "e.g. 4200 = 42.00"})
            .val(price)
            .keydown(function (e) {
                e.stopPropagation();
                return App.checkNumericInput(e, this);
            })
            .blur(function () {
                var t = $(this);
                var p = t.val();
                var correctValue = App.correctPrice(p);
                if (!correctValue || !/^\-?\d+\.\d{2}$/g.test(correctValue)) {
                    t.addClass("invalid");
                } else {
                    t.removeClass("invalid");
                    t.val(correctValue);
                    t.parents().eq(2).find(".si-price").text(correctValue);
                    /**************ATTENTION****************/
                    if (jSaleList.find(".d-discount").val() <= 100) {
                        App.recalculateTotalCost();
                    }
                }
            })
            .focus(function () {
                $(this).select();
            })
            .appendTo(individualPrice);

    var individualDiscount = $("<div>").addClass("change-discount");
    $("<div>").addClass("d-label").text("Individual Discount (%)").appendTo(individualDiscount);
    $("<input>").addClass("d-discount")
            .attr({maxlength: 3, placeholder: "0 - 100"})
            .val(0)
            .keydown(function (e) {
                e.stopPropagation();
                return App.checkNumericInput(e, this);
            })
            .blur(function () {
                var t = $(this);
                if (/^\d{1,2}$|^100$/g.test(t.val())) {
                    t.removeClass("invalid");
                    App.recalculateTotalCost();
                } else {
                    t.addClass("invalid");
                }
            })
            .focus(function () {
                $(this).select();
            })
            .appendTo(individualDiscount);

    var openDetailsLightbox = $("<div>").addClass("open-detail");
    $("<div>").addClass("d-label").text("Details").appendTo(openDetailsLightbox);

    // bind details button in sale list, generate details box
    $("<button>").addClass("d-detail")
            .click(function () {
                var detailsBox = $("<div>").attr("id", "details-box").click(function (e) {
                    e.stopPropagation();
                });
                $("<div>").addClass("db-header")
                        .append($("<div>").addClass("db-title").text("Product Details"))
                        .append($("<button>").addClass("db-close").click(function () {
                            $(this).parents().eq(2).remove();
                        })).appendTo(detailsBox);
                var lbBody = $("<div>").addClass("db-body");
                var lbInfo = $("<div>").addClass("db-info");
                $("<div>").addClass("db-name").text("Name: " + name).appendTo(lbInfo);
                $("<div>").addClass("db-price").text("Price: " + price + " Kč").appendTo(lbInfo);
                $("<div>").addClass("db-group").text("Group: " + group).appendTo(lbInfo);
                $("<div>").addClass("db-tax").text("Tax: " + tax).appendTo(lbInfo);
                $("<div>").addClass("db-tags").text("Tags: " + tags).appendTo(lbInfo);
                $("<div>").addClass("db-desc").text("Description: " + desc).appendTo(lbInfo);
                lbInfo.appendTo(lbBody);
                $("<div>").addClass("db-img").appendTo(lbBody);

                lbBody.appendTo(detailsBox);

                App.showInCurtain(detailsBox);
            })
            .appendTo(openDetailsLightbox);

    individualPrice.appendTo(details);
    individualDiscount.appendTo(details);
    openDetailsLightbox.appendTo(details);

    details.hide();
    details.appendTo(item);
    item.appendTo(jSaleList);

    jSaleList.animate({
        scrollTop: jSaleList[0].scrollHeight
    }, App.getAnimationTime());

    App.recalculateTotalCost();
    App.beep();
}
;
App.incrementLastItem = function (lastItem) {
    var lastQuantity = lastItem.find(".si-quantity");
    lastQuantity.val(parseInt(lastQuantity.val()) + 1);
    App.recalculateTotalCost();
    App.beep();
}
;
App.bindSaleGroups = function (sg, jPriceInput, jSaleList, jRegistrySession) {
    // Clicking on sale-group buttons adds an item to the sale list
    sg.find("button").click(function () {
        var t = $(this);
        // do not register an item of different group while price input is the same
        // user must type the same price for another sale group
        // reset the price input and play error sound
        var lastItem = jSaleList.find(".sale-item.last");
        if (lastItem.size() && t.attr("sg-id") !== lastItem.find(".si-id").text()
                && jRegistrySession.text() === "1") {
            jPriceInput.val("");
            return false;
        }
        var v = jPriceInput.val();

        // extract price and multiplication number
        v = v.replace(/[\s\.]+/g, "");
        var a = v.indexOf("*");
        var price = a >= 0 ? v.slice(a + 1, v.length) : v;
        if (price.length === 0 || parseInt(price) === 0) {
            jPriceInput.val("");
            return false;
        }
        var mult = App.getMultiplicationNumber(jPriceInput);

        price = App.correctPrice(price);
        jPriceInput.val(price);

        var id = t.attr("sg-id");
        var name = t.text();
        var group = t.text().toLowerCase();
        var tax = t.find(".sg-tax").text();
        var tags = t.text();
        var desc = t.text();
        App.addItemToCheckout(id, "", name, price, group, tax, tags, desc, mult);
        jRegistrySession.text("1");
    });
}
;
App.bindQuickSales = function(qs, jPriceInput, jRegistrySession){
    // bind quick sale buttons
    qs.find(".qs-item button").click(function () {
        var t = $(this);
        var price = t.parent().find(".qs-price").text();
        var mult = App.getMultiplicationNumber(jPriceInput);
        jPriceInput.val(price);
        var name = t.text();
        var id = t.parent().find(".qs-id").text();
        var tax = t.parent().find(".qs-tax").text();
        var group = t.parent().find(".qs-group").text();
        var tags = t.parent().find(".qs-tags").text();
        var desc = t.parent().find(".qs-desc").text();

        App.addItemToCheckout(id, "", name, price, group, tax, tags, desc, mult);

        jRegistrySession.text("1");
    });
}
;