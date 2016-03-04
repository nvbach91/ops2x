
App.getWindowWidth = function () {
    return window.innerWidth;
};

App.getAnimationTime = function () {
    return App.getWindowWidth() > 799 ? 100 : 0;
};

Array.prototype.binaryIndexOf = function (searchElement) {
    'use strict';

    var minIndex = 0;
    var maxIndex = this.length - 1;
    var currentIndex;
    var currentElement;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = this[currentIndex];

        if (currentElement.ean < searchElement) {
            minIndex = currentIndex + 1;
        }
        else if (currentElement.ean > searchElement) {
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
    //d = App.settings.decimal_delimiter;
    var n = this,
            c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d === undefined ? "." : d,
            t = t === undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

App.beep = function () {
    var b = document.getElementById("beep");
    b.pause();
    b.currentTime = 0;
    b.play();
};

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
};

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
        si.find(".si-total").text(subTotal.formatMoney());
    });
    saleList.find(".sale-item .si-total").each(function () {
        totalCost += parseFloat($(this).text());
    });
    totalCost.toFixed(2);
    var totalCostText = totalCost.formatMoney();
    $("#checkout-total").text("Total: " + totalCostText + " " + App.settings.currency.symbol);
    $("#pay-amount").text(totalCostText + " " + App.settings.currency.symbol);
    $("#checkout-label").text("CHECKOUT (" + itemsCnt + " item" + (itemsCnt !== 1 ? "s" : "") + ")");
};

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
    if ($.browser.mobile) {
        jpi.attr("type", "number");
    }
};

App.showInCurtain = function (s) {
    if (!$("#curtain").size()) {
        var curtain = $("<div>").attr("id", "curtain").click(function () {
            $(this).fadeOut(App.getAnimationTime(), function () {
                $(this).remove();
            });
        });
        curtain.append(s).hide();
        $("#app").append(curtain);
        curtain.fadeIn(App.getAnimationTime());
    }
};

App.getMultiplicationNumber = function (jpi) {
    var m = jpi.val().replace(/[\s\.]+/g, "");
    if (!m.match(/^\-?[1-9](\d+)?\*(\d+)?$/g)) {
        return 1;
    }
    return parseInt(m.slice(0, m.indexOf("*")));
};

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
    $("<div>").addClass("si-tax").text(tax).appendTo(main);
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
                $("<div>").addClass("db-price").text("Price: " + price + " " + App.settings.currency.symbol).appendTo(lbInfo);
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
};

App.incrementLastItem = function (lastItem) {
    var lastQuantity = lastItem.find(".si-quantity");
    lastQuantity.val(parseInt(lastQuantity.val()) + 1);
    App.recalculateTotalCost();
    App.beep();
};

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
        var group = t.attr("sg-group");
        var tax = t.attr("sg-tax");
        var tags = t.attr("sg-group");
        var desc = t.text();
        App.addItemToCheckout(id, "", name, price, group, tax, tags, desc, mult);
        jRegistrySession.text("1");
    });
};

App.bindQuickSales = function (qs, jPriceInput, jRegistrySession) {
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
};

App.makeWarning = function (msg) {
    var warning = $("<div>").attr("id", "warning-box")
            .click(function (e) {
                e.stopPropagation();
            });
    $("<div>").addClass("wb-header")
            .append($("<div>").addClass("wb-title").text("Warning"))
            .append($("<button>").addClass("wb-close").click(function () {
                $(this).parents("#curtain").fadeOut(App.getAnimationTime(), function () {
                    $(this).remove();
                });
            })).appendTo(warning);
    var warningBody = $("<div>").addClass("wb-body");
    warningBody.text(msg);
    warningBody.appendTo(warning);
    return warning;
};

App.createWebRegisterDOM = function () {
    // nav, menu-left, registry-session
    var appDOM = [
        '<nav>',
        '<div id="logo"><div></div></div>',
        '<div id="brand">EnterpriseApps</div>',
        '<div id="menu-top">',
        '<div id="profile">Profile</div>',
        '<div id="sign-out">Sign out</div>',
        '</div>',
        '</nav>',
        '<div id="menu-left">',
        '<div id="menu-header">',
        '<div></div>',
        '</div>',
        '<div id="menu-body">',
        '<button class="menu-item"></button>',
        '<button class="menu-item"></button>',
        '<button class="menu-item"></button>',
        '</div>',
        '</div>',
        '<div id="registry-session">1</div>',
        '<div id="main">',
        '<div id="col-1">',
        '<div id="live-search">',
        '<input id="search" placeholder="Search by EAN PLU" autocomplete="off">',
        '<ul id="dropdown"></ul>',
        '</div>',
        '<input id="price-input" placeholder="0.00", maxlength="9">',
        '<div id="sale-groups"></div>',
        '<div id="quick-sales"></div>',
        '</div>',
        '<div id="col-2">',
        '<div id="checkout-header">',
        '<div id="checkout-label">CHECKOUT (0 items)</div>',
        '<div id="checkout-total">Total: 0 ' + App.settings.currency.symbol + '</div>',
        '</div>',
        '<div id="checkout-btns">',
        '<button id="park-sale">Park Sale</button>',
        '<button id="discard-sale">Discard Sale</button>',
        '</div>',
        '<ul id="sale-list">',
        '<li id="si-placeholder">',
        '<div>Registered items will be dsplayed here</div>',
        '</li>',
        '</ul>',
        '<button id="pay">',
        '<span>Pay</span>',
        '<span id="pay-amount">0 ' + App.settings.currency.symbol + '</span>',
        '</button>',
        '</div>',
        '</div>',
        '<div id="kc"></div>'
    ];
    $("#app").html(appDOM.join(""));
};

App.renderWebRegister = function () {
    App.createWebRegisterDOM();
    var jKc = $("#kc");
    var jSaleList = $("#sale-list");

    // reset checkout
    $("#discard-sale").click(function () {
        jSaleList.find(".sale-item").slideUp(App.getAnimationTime(), function () {
            $(this).remove();
            App.recalculateTotalCost();
        });
    });

    var jPriceInput = $("#price-input");

    // call numpad on mobile devices
    App.setUpMobileNumericInput(jPriceInput);

    // registry session means a session when user types in prices
    // used to handle multiple articles in sale list
    var jRegistrySession = $("#registry-session");

    // Price input accepts only numeric values, also only reacts to enter and backspace
    jPriceInput.keydown(function (e) {
        return App.checkPriceInput(e, jKc, jPriceInput);
    }).blur(function () {
        var p = jPriceInput.val();
        if (!/^\-?\d+\*?(\d+)?$/g.test(p) || p === "-") {
            jPriceInput.val("");
            return false;
        }
        var a = p.indexOf("*");
        if (p.indexOf("*") >= 0) {
            var mult = App.getMultiplicationNumber(jPriceInput);
            var price = a >= 0 ? p.slice(a + 1, p.length) : p;
            if (price.length) {
                if (/^0+$/.test(price)) {
                    price = "";
                }
            }
            jPriceInput.val(mult + " * " + App.correctPrice(price));
            return true;
        }
        var sign = "";
        if (p.charAt(0) === "-") {
            p = p.slice(1);
            sign = "-";
        }
        var correctValue = App.correctPrice(p);
        if (!correctValue) {
            jPriceInput.val("");
            return false;
        }
        jPriceInput.val(sign + correctValue);
    }).click(function () {
        jPriceInput.val("");
        jRegistrySession.text("0");
    }).focus(function () {
        jPriceInput.val("");
        jRegistrySession.text("0");
    });

    // generate sale groups and quick sale
    var btns = App.settings.buttons;
    var sg = $("#sale-groups");
    for (var i = 0; i < btns.saleGroups.length; i++) {
        $("<button>", {
            class: "sg",
            "sg-id": "sg" + i,
            "sg-tax": btns.saleGroups[i].tax,
            "sg-group": btns.saleGroups[i].group,
            text: btns.saleGroups[i].text,
            css: {"background-color": "#" + btns.saleGroups[i].bg}
        }).appendTo(sg);
    }
    App.bindSaleGroups(sg, jPriceInput, jSaleList, jRegistrySession);

    var qs = $("#quick-sales");
    for (var i = 0; i < btns.quickSales.length; i++) {
        var t = btns.quickSales[i];
        $("<div>")
                .addClass("qs-item")
                .append($("<button>").text(t.text))
                .append($("<div>").addClass("qs-id").text("qs" + i))
                .append($("<div>").addClass("qs-price").text(t.price))
                .append($("<div>").addClass("qs-group").text(t.group))
                .append($("<div>").addClass("qs-tax").text(t.tax))
                .append($("<div>").addClass("qs-tags").text(t.tags))
                .append($("<div>").addClass("qs-desc").text(t.desc))
                .appendTo(qs);
    }
    App.bindQuickSales(qs, jPriceInput, jRegistrySession);

    // bind control panel buttons
    $("#logo > div").click(function () {
        $("#menu-left").addClass("visible");
    });
    $("#menu-header > div, #main").click(function () {
        $("#menu-left").removeClass("visible");
    });

    // bind pay button to proceed to payment, generate payment box
    $("#pay").click(function () {
        if (jSaleList.find(".sale-item").size() < 1) {
            return false;
        }

        //creating payment box
        var paymentBox = $("<div>").attr("id", "payment-box")
                .click(function (e) {
                    e.stopPropagation();
                });
        $("<div>").addClass("pb-header")
                .append($("<div>").addClass("pb-title").text("Payment"))
                .append($("<button>").addClass("pb-close").click(function () {
                    $(this).parents("#curtain").fadeOut(App.getAnimationTime(), function () {
                        $(this).remove();
                    });
                })).appendTo(paymentBox);
        var paymentBody = $("<div>").addClass("pb-body");
        var receipt = $("<div>").addClass("receipt");
        $("<div>").addClass("receipt-header").text("Receipt Preview").appendTo(receipt);
        var receiptBody = $("<ul>").addClass("receipt-body");
        var taxValues = {
            0: {tax: null, total: null},
            10: {tax: null, total: null},
            15: {tax: null, total: null},
            21: {tax: null, total: null}
        };
        jSaleList.find(".sale-item").each(function () {
            var t = $(this);
            var q = t.find(".si-quantity").val();
            var n = t.find(".si-name").text();
            var thisTotal = t.find(".si-total").text();
            var receiptItem = $("<li>").addClass("receipt-item")
                    .append($("<div>").addClass("ri-n").text(n))
                    .append($("<div>").addClass("ri-x"))
                    .append($("<div>").addClass("ri-q").text(q))
                    .append($("<div>").addClass("ri-tt").text(thisTotal));
            receiptBody.append(receiptItem);

            var taxRate = t.find(".si-tax").text();
            taxValues[taxRate].tax += (parseFloat(thisTotal) * parseFloat(taxRate) / 100);
            taxValues[taxRate].total += parseFloat(thisTotal);
        });
        var total = $("#pay-amount").text().replace(/,/g, ".").replace(/[^\d\.\-]/g, "");
        receiptBody.appendTo(receipt);

        //creating receipt summary
        var receiptSummary = $("<div>").attr("id", "receipt-summary");
        $("<div>").attr("id", "rs-total")
                .append($("<div>").addClass("rs-label").text("Total:"))
                .append($("<div>").addClass("rs-value").text(total))
                .appendTo(receiptSummary);
        $("<div>").attr("id", "rs-tender")
                .append($("<div>").addClass("rs-label").text("Tendered:"))
                .append($("<div>").addClass("rs-value").text(total))
                .appendTo(receiptSummary);
        $("<div>").attr("id", "rs-change")
                .append($("<div>").addClass("rs-label").text("Change:"))
                .append($("<div>").addClass("rs-value").text(Number(0).formatMoney()))
                .appendTo(receiptSummary);
        $("<div>").attr("id", "taxes-label").text("Taxes summary:").appendTo(receiptSummary);
        $("<div>").attr("id", "tax-header")
                .append($("<div>").addClass("th-rate").text("Rate"))
                .append($("<div>").addClass("th-value").text("Tax"))
                .append($("<div>").addClass("th-total").text("Total"))
                .appendTo(receiptSummary);
        var taxRates = Object.keys(taxValues);
        for (var i = 0; i < taxRates.length; i++) {
            if (taxValues[taxRates[i]].tax !== null) {
                $("<div>").addClass("rs-tax")
                        .append($("<div>").addClass("rs-tax-rate").text(taxRates[i] + "%"))
                        .append($("<div>").addClass("rs-tax-tax").text(taxValues[taxRates[i]].tax.toFixed(2)))
                        .append($("<div>").addClass("rs-tax-total").text(taxValues[taxRates[i]].total.toFixed(2)))
                        .appendTo(receiptSummary);
            }
        }
        receiptSummary.appendTo(receipt);

        //creating receipt footer
        $("<div>").addClass("receipt-footer").text("EnterpriseApps").appendTo(receipt);

        //creating payment section
        var payment = $("<div>").attr("id", "payment");
        $("<div>").addClass("cash-pay-label").text("Amount to pay").appendTo(payment);
        $("<div>").attr("id", "cash-pay-topay").text(total + " " + App.settings.currency.symbol).appendTo(payment);
        $("<div>").addClass("cash-pay-label").text("Amount tendered").appendTo(payment);
        var cashInputContainer = $("<div>").attr("id", "cash-input-container");
        var cashInput = $("<input>").attr("id", "cash-input")
                .attr("placeholder", "0.00")
                .attr("maxlength", "9")
                .val(parseFloat(total) < 0 ? 0 : total)
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
                        t.parent().find("button.cash-confirm").addClass("disabled");
                        return false;
                    }
                    t.removeClass("invalid");
                    t.parent().find("button.cash-confirm").removeClass("disabled");
                    t.val(correctValue);
                    var newChange = (parseFloat(t.val()) - parseFloat(total)).formatMoney();
                    t.parents("#payment").find("#cash-change").text(newChange + " " + App.settings.currency.symbol);
                    t.parents("#payment-box").find("#rs-tender .rs-value").text(t.val());
                    t.parents("#payment-box").find("#rs-change .rs-value").text(newChange);
                })
                .focus(function () {
                    $(this).select();
                });
        cashInput.appendTo(cashInputContainer);
        $("<button>")
                .addClass("cash-confirm").text("OK")
                .appendTo(cashInputContainer)
                .click(function () {
                    var t = $(this);
                    if (!t.hasClass("disabled")) {
                        window.print();
                    }
                });
        cashInputContainer.appendTo(payment);
        var quickCashLabel = $("<div>").addClass("cash-quick-label").text("Quick cash payment");
        quickCashLabel.appendTo(payment);
        var quickCash = $("<div>").addClass("cash-quick");
        var qcs = [100, 200, 500, 1000, 2000, 5000];
        for (var i = 0; i < qcs.length; i++) {
            $("<button>").addClass("cash-button").text(qcs[i])
                    .click(function () {
                        var t = $(this);
                        var cash = t.text();
                        $("#cash-input").val(cash + "00").blur();
                        t.parents("#payment").find("button.cash-confirm").removeClass("disabled");
                        $("#cash-change").text((cash - parseFloat(total)).formatMoney() + " " + App.settings.currency.symbol);
                    })
                    .appendTo(quickCash);
        }
        quickCash.appendTo(payment);

        $("<div>").addClass("cash-pay-label").text("Change").appendTo(payment);
        $("<div>").attr("id", "cash-change").text(Number(0).formatMoney() + " " + App.settings.currency.symbol).appendTo(payment);

        payment.appendTo(paymentBody);
        $("<div>").addClass("receipt-container").append(receipt).appendTo(paymentBody);

        paymentBody.appendTo(paymentBox);

        App.showInCurtain(paymentBox);
        cashInput.focus();
    });

    //populating articles for scanning    
    var articles = App.catalog.articles;
    for (var i = 0; i < articles.length; i++) {
        articles[i].id = i;
    }
    articles.sort(function (a, b) {
        return a.ean < b.ean ? -1 : 1;
    });
    var jSearchBox = $("#search");
    jSearchBox.keyup(function (e) {
        var t = $(this);
        if (e.keyCode === 13) {
            var filter = t.val();
            var i = articles.binaryIndexOf(filter);
            if (i >= 0) {
                var item = articles[i];
                var mult = App.getMultiplicationNumber(jPriceInput);
                App.addItemToCheckout(
                        item.id,
                        item.ean,
                        item.name,
                        item.price,
                        item.group,
                        item.tax,
                        item.tags,
                        item.desc,
                        // multiplication number
                        mult
                        );
                jRegistrySession.text("0");
                jPriceInput.val(item.price);
                t.removeClass("not-found");
            } else {
                t.addClass("not-found");
                t.attr("placeholder", "This EAN " + filter + " is not defined");
                //App.showInCurtain(App.makeWarning("This EAN " + filter + " is not defined"));
            }
            t.val("");
        }
    }).keydown(function (e) {
        e.stopPropagation();
    }).click(function () {
        $(this).removeClass("not-found");
        $(this).attr("placeholder", "Search by EAN PLU");
    }).focus(function () {
        $(this).removeClass("not-found");
        $(this).attr("placeholder", "Search by EAN PLU");
    });

    $(document).scannerDetection(function (s) {
        $("#curtain").remove();
        jSearchBox.val(s);
        var e = $.Event('keyup');
        e.keyCode = 13;
        jSearchBox.trigger(e);
        //jPriceInput.blur();
    });

    // focus price input after hitting enter if price input is not yet focused
    $(document).keydown(function (e) {
        if (e.keyCode === 27) {
            $("#curtain").remove();
        }
        if (e.keyCode === 13) {
            if (!$("#curtain").size()) {
                if (!jPriceInput.is(":focus")) {
                    jPriceInput.focus();
                    return true;
                }
            } else {
                var ci = $("#curtain #cash-input");
                if (ci.size()) {
                    ci.focus();
                }
            }
            /*if(!jPriceInput.val().length){
             
             }
             if(!jPriceInput.is(":focus")){
             jPriceInput.focus();
             return true;
             }*/
        }
    });
    $("#sign-out").click(function () {
        App.showInCurtain(App.makeLoading());
        $.ajax({
            type: "GET",
            url: "/logout"
        }).done(function () {
            App.renderLogin();
        }).fail(function () {
            App.renderLogin();
        });
    });
    /*
     dropDown.html(createFoundItem(item.name, item.price));
     dropDown.addClass("visible");
     } else {
     dropDown.html("");
     }*/
    /*$("#live-search").blur(function () {
     dropDown.html("");
     dropDown.removeClass("visible");
     });*/
};

App.initWebRegister = function () {
    $.when(
        $.getJSON("/api/catalogs", function (catalog) {
            App.catalog = catalog;
        }),
        $.getJSON("/api/settings", function (settings) {
            App.settings = settings;
        })
    ).then(function () {
        App.renderWebRegister();
    });
    /*$.ajax({
     type: "GET",
     url: "/api/settings",
     dataType: "json"
     }).done(function (settings) {
     App.settings = settings;
     App.renderWebRegister();
     });*/
};

App.makeLoading = function () {
    var loadingDOM = [
        '<div id="loading">',
        '<div class="spinner">',
        '<div class="mask">',
        '<div class="maskedCircle"></div>',
        '</div>',
        '</div>',
        '</div>'
    ];
    return $(loadingDOM.join(""));
};

App.isValidEmail = function (email) {
    if (email === "guest") {
        return true;
    }
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

App.renderSignUp = function () {

};

App.renderLogin = function () {
    var loginDOM = [
        '<div class="center-box">',
        '<div id="sign-in-welcome">Welcome to OPS</div>',
        '<form id="sign-in" action="" method="POST">',
        '<div id="sign-in-label">OPEN YOUR STORE</div>',
        '<input id="username" type="text" placeholder="EMAIL">',
        '<input id="password" type="password" placeholder="PASSWORD">',
        '<input id="submit" type="submit" value="SIGN IN">',
        '</form>',
        '</div>'
    ];
    $("#app").html(loginDOM.join(""));
    $("form#sign-in").submit(function (e) {
        e.preventDefault();
        var t = $(this);
        var username = t.find("#username").val();
        var password = t.find("#password").val();
        if (!App.isValidEmail(username) || !password.length) {
            App.showInCurtain(App.makeWarning("Please enter your email and password to sign in"));
        } else {
            App.showInCurtain(App.makeLoading());
            $.ajax({
                type: "POST",
                url: "/auth",
                dataType: "json",
                data: {
                    username: username || " ",
                    password: password || " "
                }
            }).done(function (data) {
                if (data.isAuthenticated) {
                    App.initWebRegister();
                } else {
                    alert("Wrong credentials");
                }
            }).fail(function (data) {
                $("#curtain").remove();
                var msg = "The username and/or password is invalid";
                if (data.status === 0) {
                    msg = "Network error. Please check your internet connection";
                }
                App.showInCurtain(App.makeWarning(msg));
            });
        }

        t.find("#password").val("");
    });
};
