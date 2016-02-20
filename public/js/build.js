/*
 * jQuery Scanner Detection
 *
 * Copyright (c) 2013 Julien Maurel
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 * https://github.com/julien-maurel/jQuery-Scanner-Detection
 *
 * Version: 1.1.4
 *
 */
(function ($) {
    $.fn.scannerDetection = function (options) {

        // If string given, call onComplete callback
        if (typeof options === "string") {
            this.each(function () {
                this.scannerDetectionTest(options);
            });
            return this;
        }

        var defaults = {
            onComplete: false, // Callback after detection of a successfull scanning (scanned string in parameter)
            onError: false, // Callback after detection of a unsuccessfull scanning (scanned string in parameter)
            onReceive: false, // Callback after receive a char (scanned char in parameter)
            timeBeforeScanTest: 100, // Wait duration (ms) after keypress event to check if scanning is finished
            avgTimeByChar: 30, // Average time (ms) between 2 chars. Used to do difference between keyboard typing and scanning
            minLength: 6, // Minimum length for a scanning
            endChar: [9, 13], // Chars to remove and means end of scanning
            stopPropagation: false, // Stop immediate propagation on keypress event
            preventDefault: false // Prevent default action on keypress event
        };
        if (typeof options === "function") {
            options = {onComplete: options};
        }
        if (typeof options !== "object") {
            options = $.extend({}, defaults);
        } else {
            options = $.extend({}, defaults, options);
        }

        this.each(function () {
            var self = this, $self = $(self), firstCharTime = 0, lastCharTime = 0, stringWriting = '', callIsScanner = false, testTimer = false;
            var initScannerDetection = function () {
                firstCharTime = 0;
                stringWriting = '';
            };
            self.scannerDetectionTest = function (s) {
                // If string is given, test it
                if (s) {
                    firstCharTime = lastCharTime = 0;
                    stringWriting = s;
                }
                // If all condition are good (length, time...), call the callback and re-initialize the plugin for next scanning
                // Else, just re-initialize
                if (stringWriting.length >= options.minLength && lastCharTime - firstCharTime < stringWriting.length * options.avgTimeByChar) {
                    if (options.onComplete)
                        options.onComplete.call(self, stringWriting);
                    $self.trigger('scannerDetectionComplete', {string: stringWriting});
                    initScannerDetection();
                    return true;
                } else {
                    if (options.onError)
                        options.onError.call(self, stringWriting);
                    $self.trigger('scannerDetectionError', {string: stringWriting});
                    initScannerDetection();
                    return false;
                }
            };
            $self.data('scannerDetection', {options: options}).unbind('.scannerDetection').bind('keydown.scannerDetection', function (e) {
                // Add event on keydown because keypress is not triggered for non character keys (tab, up, down...)
                // So need that to check endChar (that is often tab or enter) and call keypress if necessary
                if (firstCharTime && options.endChar.indexOf(e.which) !== -1) {
                    // Clone event, set type and trigger it
                    var e2 = jQuery.Event('keypress', e);
                    e2.type = 'keypress.scannerDetection';
                    $self.triggerHandler(e2);
                    // Cancel default
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }).bind('keypress.scannerDetection', function (e) {
                if (options.stopPropagation)
                    e.stopImmediatePropagation();
                if (options.preventDefault)
                    e.preventDefault();

                if (firstCharTime && options.endChar.indexOf(e.which) !== -1) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    callIsScanner = true;
                } else {
                    stringWriting += String.fromCharCode(e.which);
                    callIsScanner = false;
                }

                if (!firstCharTime) {
                    firstCharTime = Date.now();
                }
                lastCharTime = Date.now();

                if (testTimer)
                    clearTimeout(testTimer);
                if (callIsScanner) {
                    self.scannerDetectionTest();
                    testTimer = false;
                } else {
                    testTimer = setTimeout(self.scannerDetectionTest, options.timeBeforeScanTest);
                }

                if (options.onReceive)
                    options.onReceive.call(self, e);
                $self.trigger('scannerDetectionReceive', {evt: e});
            });
        });
        return this;
    };
})(jQuery);
/* 
 *   Created on : Jan 28, 2016, 12:24:53 PM
 *   Author     : Nguyen Viet Bach
 */


var getAnimationTime = function () {
    return window.innerWidth > 799 ? 100 : 0;
}
;

/**
 * Performs a binary search on the host array. 
 * Implement a valueOf function to your class which returns the value to be compared
 * i.e. Item.prototype.valueOf
 * The Host array must be sorted with Array.prototype.sort(function(lhs, rhs){});
 * @param {*} searchElement The item to search for within the array.
 * @return {Number} The index of the element which defaults to -1 when not found.
 */
var binaryIndexOf = function (searchElement) {
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

var endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.endsWith = endsWith;

var formatMoney = function (c, d, t) {
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

Number.prototype.formatMoney = formatMoney;

var createFoundItem = function (name, price) {
    return '<li class="dd-item">' +
            '<div class="dd-name">' + name + '</div>' +
            '<div class="dd-price">' + price + '</div>' +
            '</li>';
};

var isFloat = function (n) {
    return n === Number(n) && n % 1 !== 0;
}
;

var beep = function () {
    var b = document.getElementById("beep");
    b.pause();
    b.currentTime = 0;
    b.play();
}
;

var correctPrice = function (pr) {
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

var recalculateTotalCost = function () {
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
    var totalCostText = totalCost.formatMoney(2, ",", " ");
    $("#checkout-total").text("Total: " + totalCostText + " Kč");
    $("#pay-amount").text(totalCostText + " Kč");
    $("#checkout-label").text("CHECKOUT (" + itemsCnt + " item" + (itemsCnt !== 1 ? "s" : "") + ")");
}
;

var checkPriceInput = function (e, u, p) {
    u.text("keyCode: " + e.keyCode);
    //var p = $("#price-input");
    if (e.keyCode === 13) { // allow enter 
        if (p.val().length) {
            p.blur();
        }
        return true;
    }
    if (e.keyCode === 8) { //allow backspace)
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

var checkNumericInput = function (e, t) {
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

var showInCurtain = function (s) {
    var curtain = $("<div></div>").attr("id", "curtain").click(function () {
        $(this).fadeOut(getAnimationTime(), function () {
            $(this).remove();
        });
    });
    curtain.append(s).hide();
    $("#app").append(curtain);
    curtain.fadeIn(getAnimationTime());
}
;

var getMultiplicationNumber = function (jpi) {
    var m = jpi.val();
    if (!m.match(/^\-?[1-9](\d+)?\*(\d+)?$/g)) {
        return 1;
    }
    return parseInt(m.slice(0, m.indexOf("*")));
}
;

var addItemToCheckout = function (id, ean, name, price, group, tax, tags, desc, mult) {
    var jSaleList = $("#sale-list");
    var lastItem = jSaleList.find(".sale-item.last");
    if (id.toString() === lastItem.find(".si-id").text()) {
        if ($("#registry-session").text() === "1") {
            incrementLastItem(lastItem);
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
    var main = $("<div></div>").addClass("sale-item-main");
    $("<div></div>").addClass("si-id").text(id).appendTo(main);
    $("<div></div>").addClass("si-ean").text(ean).appendTo(main);
    $("<div></div>").addClass("si-name").text(name).appendTo(main);
    $("<input />")
            .addClass("si-quantity")
            .attr({maxlength: 3})
            .val(mult ? mult : 1)
            .keydown(function (e) {
                checkNumericInput(e, this);
            })
            .focus(function () {
                $(this).select();
            })
            .blur(function () {
                if (!$(this).val()) {
                    ($(this).val(0));
                }
                recalculateTotalCost();
            })
            .appendTo(main);
    $("<div></div>").addClass("si-price").text(price).appendTo(main);
    $("<div></div>").addClass("si-total").text(price).appendTo(main);
    $("<button></button")
            .addClass("si-remove")
            .click(function () {
                $(this).parent().parent().slideUp(getAnimationTime(), function () {
                    $(this).remove();
                    recalculateTotalCost();
                });
            })
            .appendTo(main);
    main.children(".si-name, .si-price, .si-total").click(function () {
        $(this).parent().parent().find(".sale-item-extend")
                .slideToggle(getAnimationTime(), function () {
                    var t = $(this);
                    if (t.is(":hidden")) {
                        t.parent().removeClass("expanded");
                    } else {
                        t.parent().addClass("expanded");
                    }
                });
    });
    main.appendTo(item);
    var details = $("<div></div>").addClass("sale-item-extend");

    var individualPrice = $("<div></div>").addClass("change-price");
    $("<div></div>").addClass("d-label").text("Individual Price").appendTo(individualPrice);
    $("<input />")
            .addClass("d-price")
            .attr({maxlength: 7, placeholder: "e.g. 4200 = 42.00"})
            .val(price)
            .keydown(function (e) {
                checkNumericInput(e, this);
            })
            .blur(function () {
                var t = $(this);
                var p = t.val();
                var correctValue = correctPrice(p);
                if (!correctValue || !/^\-?\d+\.\d{2}$/g.test(correctValue)) {
                    t.addClass("invalid");
                } else {
                    t.removeClass("invalid");
                    t.val(correctValue);
                    t.parents().eq(2).find(".si-price").text(correctValue);
                    /**************ATTENTION****************/
                    if (jSaleList.find(".d-discount").val() <= 100) {
                        recalculateTotalCost();
                    }
                }
            })
            .focus(function () {
                $(this).select();
            })
            .appendTo(individualPrice);

    var individualDiscount = $("<div></div>").addClass("change-discount");
    $("<div></div>").addClass("d-label").text("Individual Discount (%)").appendTo(individualDiscount);
    $("<input />").addClass("d-discount")
            .attr({maxlength: 3, placeholder: "0 - 100"})
            .val(0)
            .keydown(function (e) {
                checkNumericInput(e, this);
            })
            .blur(function () {
                var t = $(this);
                if (/^\d{1,2}$|^100$/g.test(t.val())) {
                    t.removeClass("invalid");
                    recalculateTotalCost();
                } else {
                    t.addClass("invalid");
                }
            })
            .focus(function () {
                $(this).select();
            })
            .appendTo(individualDiscount);

    var openDetailsLightbox = $("<div></div>").addClass("open-detail");
    $("<div></div>").addClass("d-label").text("Details").appendTo(openDetailsLightbox);

    // bind details button in sale list, generate details box
    $("<button></button>").addClass("d-detail")
            .click(function () {
                var detailsBox = $("<div></div>").attr("id", "details-box").click(function (e) {
                    e.stopPropagation();
                });
                $("<div></div>").addClass("db-header")
                        .append($("<div></div>").addClass("db-title").text("Product Details"))
                        .append($("<button></button>").addClass("db-close").click(function () {
                            $(this).parents().eq(2).remove();
                        })).appendTo(detailsBox);
                var lbBody = $("<div></div>").addClass("db-body");
                var lbInfo = $("<div></div>").addClass("db-info");
                $("<div></div>").addClass("db-name").text("Name: " + name).appendTo(lbInfo);
                $("<div></div>").addClass("db-price").text("Price: " + price + " Kč").appendTo(lbInfo);
                $("<div></div>").addClass("db-group").text("Group: " + group).appendTo(lbInfo);
                $("<div></div>").addClass("db-tax").text("Tax: " + tax).appendTo(lbInfo);
                $("<div></div>").addClass("db-tags").text("Tags: " + tags).appendTo(lbInfo);
                $("<div></div>").addClass("db-desc").text("Description: " + desc).appendTo(lbInfo);
                lbInfo.appendTo(lbBody);
                $("<div></div>").addClass("db-img").appendTo(lbBody);

                lbBody.appendTo(detailsBox);

                showInCurtain(detailsBox);
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
    }, getAnimationTime());

    recalculateTotalCost();
    beep();
}
;
var incrementLastItem = function (lastItem) {
    var lastQuantity = lastItem.find(".si-quantity");
    lastQuantity.val(parseInt(lastQuantity.val()) + 1);
    recalculateTotalCost();
    beep();
}
;
/* 
 *   Created on : Jan 28, 2016, 12:24:53 PM
 *   Author     : Nguyen Viet Bach
 */

var Item = function (id, ean, name, price, group, tax, tags, desc) {
    this.id = id;
    this.ean = ean;
    this.name = name;
    this.price = price;
    this.group = group;
    this.tax = tax;
    this.tags = tags;
    this.desc = desc;
};

Item.prototype.valueOf = function () {
    return this.ean;
};


/* 
 *   Created on : Jan 28, 2016, 12:24:53 PM
 *   Author     : Nguyen Viet Bach
 */

Array.prototype.binaryIndexOf = binaryIndexOf;

$(document).ready(function () {
    var kc = $("#kc");
    // reset checkout
    var jSaleList = $("#sale-list");
    $("#discard-sale").click(function () {
        jSaleList.find(".sale-item").slideUp(getAnimationTime(), function () {
            $(this).remove();
            recalculateTotalCost();
        });
    });

    // Price input accepts only numeric values, also only reacts to enter and backspace
    var jPriceInput = $("#price-input");
    var jRegistrySession = $("#registry-session");
    jPriceInput.keydown(function (e) {
        return checkPriceInput(e, kc, jPriceInput);
    }).blur(function () {
        var p = $(this).val();
        if (!/^\-?\d+\*?(\d+)?$/g.test(p) || p === "-") {
            $(this).val("");
            return false;
        }
        if (p.indexOf("*") >= 0) {
            return true;
        }
        var sign = "";
        if (p.charAt(0) === "-") {
            p = p.slice(1);
            sign = "-";
        }
        var correctValue = correctPrice(p);
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

    // Clicking on sale-group buttons adds an item to the sale list
    $("#sale-groups button").click(function () {
        var t = $(this);
        //var lastItem = jSaleList.find(".sale-item.last");
        // do not register an item of different group while price input is the same
        // user must type the same price for another sale group
        // reset the price input and play error sound
        var lastItem = jSaleList.find(".sale-item.last");
        if (lastItem.size() && t.text() !== lastItem.find(".si-id").text()
                && jRegistrySession.text() === "1") {
            jPriceInput.val("");
            return false;
        }
        var v = jPriceInput.val();
        var a = v.indexOf("*");
        var price = a >= 0 ? v.slice(a + 1, v.length) : v;
        if (price.length === 0 || parseInt(price) === 0) {
            jPriceInput.val("");
            return false;
        }
        var mult = getMultiplicationNumber(jPriceInput);
        
        price = correctPrice(price);
        jPriceInput.val(price);
        
        var id = t.text();
        var name = t.text();
        var group = t.text();
        var tax = t.text();
        var tags = t.text();
        var desc = t.text();
        addItemToCheckout(id, "", name, price, group, tax, tags, desc, mult);
        jRegistrySession.text("1");
    });

    // bind quick sell buttons
    $("#quick-sales .qs-item button").click(function () {
        var t = $(this);
        var price = t.parent().find(".qs-price").text();
        var mult = getMultiplicationNumber(jPriceInput);
        jPriceInput.val(price);
        var name = t.text();
        var id = t.parent().find(".qs-id").text();
        var tax = t.parent().find(".qs-tax").text();
        var group = t.parent().find(".qs-group").text();
        var tags = t.parent().find(".qs-tags").text();
        var desc = t.parent().find(".qs-desc").text();
        
        addItemToCheckout(id, "", name, price, group, tax, tags, desc, mult);

        jRegistrySession.text("1");
    });

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
        var paymentBox = $("<div></div>").attr("id", "payment-box")
                .click(function (e) {
                    e.stopPropagation();
                });
        $("<div></div>").addClass("pb-header")
                .append($("<div></div>").addClass("pb-title").text("Payment"))
                .append($("<button></button>").addClass("pb-close").click(function () {
                    $(this).parents("#curtain").fadeOut(getAnimationTime(), function () {
                        $(this).remove();
                    });
                })).appendTo(paymentBox);
        var paymentBody = $("<div></div>").addClass("pb-body");
        var receipt = $("<div></div>").addClass("receipt");
        $("<div></div>").addClass("receipt-header").text("Receipt Preview").appendTo(receipt);
        var receiptBody = $("<ul></ul>").addClass("receipt-body");
        jSaleList.find(".sale-item").each(function () {
            var t = $(this);
            var q = t.find(".si-quantity").val();
            var n = t.find(".si-name").text();
            var thisTotal = t.find(".si-total").text();
            var receiptItem = $("<li></li>").addClass("receipt-item")
                    .append($("<div></div>").addClass("ri-n").text(n))
                    .append($("<div></div>").addClass("ri-x"))
                    .append($("<div></div>").addClass("ri-q").text(q))
                    .append($("<div></div>").addClass("ri-tt").text(thisTotal));
            receiptBody.append(receiptItem);
        });
        var total = $("#pay-amount").text().replace(/,/g, ".").replace(/[^\d\.\-]/g, "");
        receiptBody.appendTo(receipt);
        $("<div></div>").addClass("receipt-footer").text("EnterpriseApps").appendTo(receipt);

        var payment = $("<div></div>").attr("id", "payment");
        $("<div></div>").addClass("cash-pay-label").text("Amount to pay").appendTo(payment);
        $("<div></div>").attr("id", "cash-pay-topay").text(total + " Kč").appendTo(payment);
        $("<div></div>").addClass("cash-pay-label").text("Amount tendered").appendTo(payment);
        var cashInputContainer = $("<div></div>").attr("id", "cash-input-container");
        $("<input/>").attr("id", "cash-input")
                .attr("placeholder", "0.00")
                .attr("maxlength", "6")
                .val(parseFloat(total) < 0 ? 0 : total)
                .keydown(function (e) {
                    return checkNumericInput(e, this);
                })
                .blur(function () {
                    var t = $(this);
                    var p = t.val();
                    var correctValue = correctPrice(p);
                    if (!correctValue || !/^\-?\d+\.\d{2}$/g.test(correctValue)) {
                        t.addClass("invalid");
                        t.parent().find("button.cash-confirm").addClass("disabled");
                        return false;
                    }
                    t.removeClass("invalid");
                    t.parent().find("button.cash-confirm").removeClass("disabled");
                    t.val(correctValue);
                    $("#cash-change").text(parseFloat(t.val()) - parseFloat(total) + " Kč");
                })
                .focus(function () {
                    $(this).select();
                }).appendTo(cashInputContainer);
        $("<button></button>").addClass("cash-confirm").text("OK")
                .appendTo(cashInputContainer)
                .click(function () {
                    var t = $(this);
                    if (!t.hasClass("disabled")) {

                    }
                });

        cashInputContainer.appendTo(payment);
        var quickCashLabel = $("<div></div>").addClass("cash-quick-label").text("Quick cash payment");
        quickCashLabel.appendTo(payment);
        var quickCash = $("<div></div>").addClass("cash-quick");
        var qcs = [100, 200, 500, 1000, 2000, 5000];
        for (var i = 0; i < qcs.length; i++) {
            $("<button></button>").addClass("cash-button").text(qcs[i])
                    .click(function () {
                        var t = $(this);
                        var cash = t.text();
                        $("#cash-input").val(cash + "00").blur();
                        t.parents("#payment").find("button.cash-confirm").removeClass("disabled");
                        $("#cash-change").text(cash - parseFloat(total) + " Kč");
                    })
                    .appendTo(quickCash);
        }
        quickCash.appendTo(payment);

        $("<div></div>").addClass("cash-pay-label").text("Change").appendTo(payment);
        $("<div></div>").attr("id", "cash-change").text(0).appendTo(payment);

        payment.appendTo(paymentBody);
        $("<div></div>").addClass("receipt-container").append(receipt).appendTo(paymentBody);

        paymentBody.appendTo(paymentBox);

        showInCurtain(paymentBox);
    });

    var catalog = {items: []};
    for (var i = 0; i < 1; i++) {
        catalog.items.push(new Item(
                Math.floor((Math.random() * 10) + 1) + i,
                "40152233",
                "Water " + i,
                (15 + i) + ".00",
                "description"
                ));
    }
    catalog.items.sort(function (a, b) {
        return a.ean < b.ean ? -1 : 1;
    });
    //g = catalog.items;
    //var dropDown = $("#dropdown");
    var jSearchBox = $("#search");
    jSearchBox.keyup(function (e) {
        var t = $(this);
        if (e.keyCode === 13) {
            var filter = t.val();
            var i = catalog.items.binaryIndexOf(filter);
            if (i >= 0) {
                var item = catalog.items[i];
                var mult = getMultiplicationNumber(jPriceInput);
                addItemToCheckout(
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
                jPriceInput.val("");
                t.removeClass("not-found");
            } else {
                t.addClass("not-found");
            }
            t.val("");
        }
    }).click(function () {
        $(this).removeClass("not-found");
    }).focus(function () {
        $(this).removeClass("not-found");
    });

    $(document).scannerDetection(function (s) {
        jPriceInput.blur();
        jSearchBox.val(s);
        var e = $.Event('keyup');
        e.keyCode = 13;
        jSearchBox.trigger(e);
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
});
