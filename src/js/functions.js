
/* global App */

// returns current window width for animations
App.getWindowWidth = function () {
    return window.innerWidth;
};

// decides on animation time
App.getAnimationTime = function () {
    return App.getWindowWidth() > 799 ? 100 : 0;
};

// binary search of ean code in array
Array.prototype.binaryIndexOf = function (searchEAN) {
    "use strict";

    var minIndex = 0;
    var maxIndex = this.length - 1;
    var currentIndex;
    var currentElement;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = this[currentIndex];

        if (currentElement.ean < searchEAN) {
            minIndex = currentIndex + 1;
        }
        else if (currentElement.ean > searchEAN) {
            maxIndex = currentIndex - 1;
        }
        else {
            return currentIndex;
        }
    }

    return -1;
};

// compares the value with the suffix of a string
String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// formats a number to a price string, e.g. 5.00
Number.prototype.formatMoney = function (c, d, t) {
    //d = App.settings.decimal_delimiter;
    var n = this,
            c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d === undefined ? "." : d,
            t = t === undefined ? "" : t,
            s = n < 0 ? "-" : "",
            i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

App.parseTime = function (s) {
    return s < 10 ? "0" + s : s;
};

App.week = [
    {short: "Mon", long: "Monday"},
    {short: "Tue", long: "Tuesday"},
    {short: "Wed", long: "Wednesday"},
    {short: "Thu", long: "Thursday"},
    {short: "Fri", long: "Friday"},
    {short: "Sat", long: "Saturday"},
    {short: "Sun", long: "Sunday"}
];

App.getDate = function () {
    var now = new Date();
    var day = App.week[now.getDay()].short;
    var date = App.parseTime(now.getDate());
    var month = App.parseTime(now.getMonth() + 1);
    var year = App.parseTime(now.getFullYear());
    var hh = App.parseTime(now.getHours());
    var mm = App.parseTime(now.getMinutes());
    var ss = App.parseTime(now.getSeconds());

    return day + " " + date + "/" + month + "/" + year + " " + hh + ":" + mm + ":" + ss;
};

App.startReceiptTime = function () {
    clearInterval(App._receiptTimeInterval);
    App._receiptTimeInterval = setInterval(function () {
        App.receiptTime.text(App.getDate());
    }, 500);
};

// plays beep sound
App.beep = function () {
    App.beeper.pause();
    App.beeper.currentTime = 0;
    App.beeper.play();
};

// corrects input price value, eg. adds decimal points, reformats bad inputs
App.correctPrice = function (pr) {
    var p = pr.replace(/\./g, "");
    var correctValue = "";
    while (p.length > 2 && p.charAt(0) === "0") {
        p = p.slice(1);
    }
    if (parseInt(p) === 0) {
        return "0.00";
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

// goes through current sale list and calculates the total cost
App.recalculateTotalCost = function () {
    if (App.jSaleList.children().size() === 1) {
        App.jSiPlaceholder.removeClass("hidden");
    }
    var totalCost = 0;
    var itemsCnt = 0;
    App.jSaleList.find(".sale-item").each(function () {
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
    App.jSaleList.find(".sale-item .si-total").each(function () {
        totalCost += parseFloat($(this).text());
    });
    totalCost.toFixed(2);
    var totalCostText = totalCost.formatMoney();
    App.jCheckoutTotal.text("Total: " + totalCostText + " " + App.settings.currency.symbol);
    App.jPayAmount.text(totalCostText);
    App.jCheckoutLabel.text("CHECKOUT (" + itemsCnt + " item" + (itemsCnt !== 1 ? "s" : "") + ")");
};

// corrects input in price input
App.correctPriceInput = function () {
    var p = App.jPriceInput.val();
    if (!/^\-?\d+\*?(\d+)?$/g.test(p) || p === "-") {
        App.jPriceInput.val("");
        return false;
    }
    var a = p.indexOf("*");
    if (p.indexOf("*") >= 0) {
        var mult = App.getMultiplicationNumber();
        var price = a >= 0 ? p.slice(a + 1, p.length) : p;
        if (price.length) {
            if (/^0+$/.test(price)) {
                price = "";
            }
        }
        App.jPriceInput.val(mult + "*" + App.correctPrice(price));
        return true;
    }
    var sign = "";
    if (p.charAt(0) === "-") {
        p = p.slice(1);
        sign = "-";
    }
    var correctValue = App.correctPrice(p);
    if (!correctValue) {
        App.jPriceInput.val("");
        return false;
    }
    App.jPriceInput.val(sign + correctValue);
};

// checks inputs for price input
App.checkPriceInput = function (e) {
    e.stopPropagation();
    App.jKc.text("keyCode: " + e.keyCode);
    if (e.keyCode === 27) {
        App.jPriceInput.blur();
        return true;
    }
    if (e.keyCode === 13) { // allow enter 
        if (App.jPriceInput.val().length) {
            App.jPriceInput.blur();
        }
        return true;
    }
    if (e.keyCode === 8 || e.keyCode === 9) { //allow backspace)
        return true;
    }
    if (e.keyCode === 109 || e.keyCode === 189 || e.keyCode === 173) { // check for multiple dashes
        if (App.jPriceInput.val().length > 0) {
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
        if (App.jPriceInput.val().length === 0 || App.jPriceInput.val().length > 3) {
            return false;
        }
        if (App.jPriceInput.val().indexOf("*") < 0) {
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

// allows only numbers
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

// sets the mobile device native keyboard to numeric
App.setUpMobileNumericInput = function (input) {
    if ($.browser.mobile) {
        input.attr("type", "number");
    }
};

// curtain closes
App.closeCurtain = function () {
    if (App.curtain) {
        App.jMain ? App.jMain.removeClass("blur") : null;
        App.curtain.remove();
        App.curtain = null;
    }
};

// used for showing boxes and messages
App.showInCurtain = function (show) {
    if (!App.curtain) {
        App.jMain ? App.jMain.addClass("blur") : null;
        App.curtain = $("<div>").attr("id", "curtain").click(function () {
            App.closeCurtain();
        }).append(show).hide().appendTo(App.jAppContainer).fadeIn(App.getAnimationTime());
    }
};

// parses the multiplication number in the price input for multiple checkout
App.getMultiplicationNumber = function () {
    var m = App.jPriceInput.val().replace(/[\s\.]+/g, "");
    if (!m.match(/^\-?[1-9](\d+)?\*(\d+)?$/g)) {
        return 1;
    }
    return parseInt(m.slice(0, m.indexOf("*")));
};

// adds an item(s) to the checkout
App.addItemToCheckout = function (id, ean, name, price, group, tax, tags, desc, mult) {
    App.jPayAmount.removeClass("checked");
    var lastItem = App.jSaleList.find(".sale-item.last");
    if (id.toString() === lastItem.find(".si-id").text()) {
        if (App.isInRegistrySession/*.text() === "1"*/) {
            App.incrementLastItem(lastItem);
            return true;
        }
    }
    if (App.jSiPlaceholder.size()) {
        App.jSiPlaceholder.addClass("hidden");
    }
    if (App.jSaleList.children().size() > 0) {
        App.jSaleList.children().eq(App.jSaleList.children().size() - 1).removeClass("last");
    }
    // creating sale item and bind events
    var saleItem = $("<li>").addClass("sale-item last");
    var siMain = $("<div>").addClass("sale-item-main");
    $("<div>").addClass("si-id").text(id).appendTo(siMain);
    $("<div>").addClass("si-ean").text(ean).appendTo(siMain);
    $("<input>").addClass("si-name").click(function () {
        $(this).select();
    }).val(name).appendTo(siMain);
    $("<input>")
            .addClass("si-quantity")
            .attr({maxlength: 3})
            .val(mult ? mult : 1)
            .keydown(function (e) {
                e.stopPropagation();
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
            .appendTo(siMain);
    $("<div>").addClass("si-tax").text(tax).appendTo(siMain);
    $("<div>").addClass("si-price").text(price).appendTo(siMain);
    $("<div>").addClass("si-total").text(price).appendTo(siMain);
    $("<button>")
            .addClass("si-remove")
            .click(function () {
                saleItem.slideUp(App.getAnimationTime(), function () {
                    $(this).remove();
                    App.recalculateTotalCost();
                    App.jPriceInput.blur();
                });
            })
            .appendTo(siMain);
    siMain.children(".si-price, .si-total").click(function () {
        saleItem.find(".sale-item-extend")
                .slideToggle(App.getAnimationTime(), function () {
                    var t = $(this);
                    if (t.is(":hidden")) {
                        t.parent().removeClass("expanded");
                    } else {
                        t.parent().addClass("expanded");
                    }
                });
    });
    siMain.appendTo(saleItem);
    var siExtension = $("<div>").addClass("sale-item-extend");

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
                    //if (App.jSaleList.find(".d-discount").val() <= 100) {
                    App.recalculateTotalCost();
                    //}
                }
            })
            .focus(function () {
                $(this).select();
            })
            .appendTo(individualPrice);

    var individualDiscount = $("<div>").addClass("change-discount");
    $("<div>").addClass("d-label").text("Individual Discount (%)").appendTo(individualDiscount);
    $("<input>").addClass("d-discount")
            .attr({maxlength: 2, placeholder: "0 - 100"})
            .val(0)
            .keydown(function (e) {
                e.stopPropagation();
                return App.checkNumericInput(e, this);
            })
            .blur(function () {
                var t = $(this);
                if (/^\d{1,2}$|^100$/g.test(t.val())) {
                    App.recalculateTotalCost();
                } else {
                    t.val(0);
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
                            App.closeCurtain();
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

    individualPrice.appendTo(siExtension);
    individualDiscount.appendTo(siExtension);
    openDetailsLightbox.appendTo(siExtension);

    siExtension.hide();
    siExtension.appendTo(saleItem);
    saleItem.appendTo(App.jSaleList);

    App.jSaleList.animate({
        scrollTop: App.jSaleList[0].scrollHeight
    }, App.getAnimationTime());

    App.recalculateTotalCost();
    App.beep();
};

// increments the quantity of the last item in the checkout
App.incrementLastItem = function (lastItem) {
    var lastQuantity = lastItem.find(".si-quantity");
    lastQuantity.val(parseInt(lastQuantity.val()) + 1);
    App.recalculateTotalCost();
    App.beep();
};

// binds salegroups button events
App.bindSaleGroups = function (sg) {
    // Clicking on sale-group buttons adds an item to the sale list
    sg.find("button").click(function () {
        var t = $(this);
        // do not register an item of different group while price input is the same
        // user must type the same price for another sale group
        // reset the price input and play error sound
        var lastItem = App.jSaleList.find(".sale-item.last");
        if (lastItem.size() && t.attr("sg-id") !== lastItem.find(".si-id").text()
                && App.isInRegistrySession/*.text() === "1"*/) {
            App.jPriceInput.val("");
            return false;
        }
        var v = App.jPriceInput.val();

        // extract price and multiplication number
        v = v.replace(/[\s\.]+/g, "");
        var a = v.indexOf("*");
        var price = a >= 0 ? v.slice(a + 1, v.length) : v;
        if (price.length === 0 || parseInt(price) === 0) {
            App.jPriceInput.val("");
            return false;
        }
        var mult = App.getMultiplicationNumber();

        price = App.correctPrice(price);
        App.jPriceInput.val(price);

        var id = t.attr("sg-id");
        var name = t.text();
        var group = t.attr("sg-group");
        var tax = t.attr("sg-tax");
        var tags = t.attr("sg-group");
        var desc = t.text();
        App.addItemToCheckout(id, "", name, price, group, tax, tags, desc, mult);
        App.isInRegistrySession = true/*.text("1")*/;
        App.justUsedScanner = false;
    });
};

// binds quicksales button events
App.bindQuickSales = function (qs) {
    // bind quick sale buttons
    qs.find(".qs-item").click(function () {
        var t = $(this);
        var price = t.find(".qs-price").text().replace(/[^\d\.]/g, "");
        var mult = App.getMultiplicationNumber();
        App.jPriceInput.val(price);
        var name = t.find("button").text();//
        var id = t.find(".qs-id").text();
        var tax = t.find(".qs-tax").text();
        var group = t.find(".qs-group").text();
        var tags = t.find(".qs-tags").text();
        var desc = t.find(".qs-desc").text();

        App.addItemToCheckout(id, "", name, price, group, tax, tags, desc, mult);

        App.isInRegistrySession = true/*.text("1")*/;
        App.justUsedScanner = false;
    });
};

// displays a warning message
App.showWarning = function (msg) {
    var warning =
            '<div id="warning-box">\
                    <div class="wb-header">\
                        <div class="wb-title"></div>\
                        <button class="wb-close"></button>\
                    </div>\
                    <div class="wb-body">' + msg + '</div>\
                </div>';
    App.showInCurtain(warning);
    App.curtain.find("#warning-box").click(function (e) {
        e.stopPropagation();
    });
    App.curtain.find("button.wb-close").click(function () {
        App.closeCurtain();
    });
};

// remove the current sale list
App.discardSale = function (immediate) {
    if (immediate) {
        App.jSaleList.find(".sale-item").remove();
        App.recalculateTotalCost();
    } else {
        App.jSaleList.find(".sale-item").slideUp(App.getAnimationTime(), function () {
            $(this).remove();
            App.recalculateTotalCost();
        });
    }
};

// appends the dom structure to web register
App.createWebRegisterDOM = function () {
    // nav, menu-left, registry-session
    var appDOM =
            '<nav>\
                <div id="logo"><div class="logo"></div></div>\
                <div id="brand">EnterpriseApps</div>\
                <div id="menu-top">\
                    <div id="profile">' + App.settings.name + '</div>\
                    <div id="sign-out">Sign out</div>\
                </div>\
             </nav>\
             <div id="control-panel">\
                <div id="cp-header">\
                   <div class="logo"></div>\
                   <div class="label">Control Panel</div>\
                   <div class="close"></div>\
                </div>\
                <div id="cp-body"></div>\
             </div>\
             <div id="registry-session">1</div>\
             <div id="main">\
                <div id="col-1">\
                    <div id="live-search">\
                        <input id="search" maxlength="13" placeholder="PLU" autocomplete="off">\
                        <ul id="dropdown"></ul>\
                    </div>\
                    <input id="price-input" placeholder="0.00" maxlength="9">\
                    <div id="reg-buttons">\
                        <div id="sale-groups"></div>\
                        <div id="tabs"></div>\
                    </div>\
                    <div id="tab-navs"></div>\
                </div>\
                <div id="col-2">\
                   <div id="checkout-header">\
                       <div id="checkout-label">CHECKOUT (0 items)</div>\
                       <div id="checkout-total">Total: 0 ' + App.settings.currency.symbol + '</div>\
                   </div>\
                   <div id="checkout-btns">\
                       <button id="park-sale">Park Sale</button>\
                       <button id="discard-sale">Discard Sale</button>\
                   </div>\
                   <ul id="sale-list">\
                       <li id="si-placeholder">\
                           <div>Registered items will be dsplayed here</div>\
                       </li>\
                   </ul>\
                   <div id="keyboard">\
                        <button id="btnp">PLU</button>\
                        <button id="btn7">7</button>\
                        <button id="btn8">8</button>\
                        <button id="btn9">9</button>\
                        <button id="btnm"></button>\
                        <button id="btn4">4</button>\
                        <button id="btn5">5</button>\
                        <button id="btn6">6</button>\
                        <button id="btnn">-</button>\
                        <button id="btn1">1</button>\
                        <button id="btn2">2</button>\
                        <button id="btn3">3</button>\
                        <button id="btnc">C</button>\
                        <button id="btn0">0</button>\
                        <button id="btn00">00</button>\
                        <button id="btnb"></button>\
                   </div>\
                   <div id="paycalc">\
                       <button id="subtotal">Sub</button>\
                       <div id="pay">\
                           <div id="pay-label">Pay</div>\
                           <div id="pay-amount">0</div>\
                           <div id="pay-currency">' + App.settings.currency.symbol + '</div>\
                       </div>\
                    </div>\
                </div>\
             </div>\
             <div id="kc"></div>'
            ;
    App.jAppContainer.html(appDOM);
};

// returns a enter keyup event
App.simulateEnterKeyup = function () {
    var e = $.Event("keyup");
    e.keyCode = 13;
    return e;
};

// binds events to virtual keyboard
App.bindKeyboard = function () {
    var keyboard = $("#keyboard");
    var btnPLU = keyboard.find("#btnp");
    var btnMul = keyboard.find("#btnm");
    $("#keyboard button").click(function () {
        if (App.isInRegistrySession/*.text() === "1"*/) {
            App.isInRegistrySession = false/*.text("0")*/;
            App.jPriceInput.val("");
        }
        var t = $(this);
        var id = t.attr("id");
        var isPluActive = btnPLU.hasClass("activePLU");
        var activeInput = isPluActive ? App.jSearchBox : App.jPriceInput;
        var inputMaxlength = isPluActive ? 13 : 9;
        var p = activeInput.val();
        switch (id) {
            case "btnp": //PLU
                if (!isPluActive) { // turn on PLU input and turn off Price input
                    btnPLU.addClass("activePLU");
                    App.jLiveSearch.addClass("activePLU");
                    App.jPriceInput.hide();
                    btnMul.text("OK").addClass("activePLU");
                    activeInput.val("");
                    activeInput = App.jSearchBox;
                    activeInput.focus();
                } else { // turn off PLU input and turn on Price input
                    btnPLU.removeClass("activePLU");
                    App.jLiveSearch.removeClass("activePLU");
                    App.jPriceInput.show();
                    btnMul.text("").removeClass("activePLU");
                    activeInput.val("");
                    activeInput = App.jPriceInput;
                }
                break;
            case "btnm": //multiplication symbol or confirm PLU
                if (isPluActive) {
                    App.jSearchBox.trigger(App.simulateEnterKeyup());
                } else {
                    if (p.length > 0 && p.length <= 3 && p.indexOf("*") < 0 && p !== "-") {
                        activeInput.val(p + "*");
                    }
                }
                break;
            case "btnn": //negative symbol
                if (!isPluActive) {
                    if (p.length === 0) {
                        activeInput.val("-");
                    }
                }
                break;
            case "btnc": //clear
                activeInput.val("");
                break;
            case "btnb": //backspace
                if (p.length > 0) {
                    activeInput.val(p.slice(0, -1));
                }
                break;
            default: //numbers
                if ((p + t.text()).length <= inputMaxlength) {
                    activeInput.val(p + t.text());
                }
        }
        App.beep();
    });
};

// initializes some global variables and functions
App.init = function () {
    App.jAppContainer = $("#app");
    App.loadingScreen = $('<div id="loading"></div>');
    App.curtain = null;
    App.justUsedScanner = false;
    App._timeBetweenConsecutiveScannings = 2000;
    // esc to remove curtain, focus price input after hitting enter if price input is not yet focused
    $(document).keydown(function (e) {
        if (e.keyCode === 27) {
            App.closeCurtain();
        } else if (e.keyCode === 13) {
            if (!App.curtain && App.jPriceInput && !App.justUsedScanner) {
                App.jPriceInput.focus();
            } else if (App.jCashInput) {
                App.jCashInput.focus();
            }
        }
        return true;
    });
    /*$(window).on("beforeunload", function () {
        return "You are about to close this application. Any unsaved work will be lost!";
    });*/
};

// render web register view
App.renderWebRegister = function () {
    App.closeCurtain();
    App.createWebRegisterDOM();
    App.bindKeyboard();
    App.jMain = $("#main");
    App.jSiPlaceholder = $("#si-placeholder");
    App.beeper = new Audio("../sound/beep7.mp3");
    App.jKc = $("#kc");
    App.jSaleList = $("#sale-list");
    App.jPriceInput = $("#price-input");
    App.jPayAmount = $("#pay-amount");
    App.jCheckoutTotal = $("#checkout-total");
    App.jCheckoutLabel = $("#checkout-label");
    App.jLiveSearch = $("#live-search");
    App.jControlPanel = $("#control-panel");

    App.cpBody = App.jControlPanel.find("#cp-body");
    App.createControlPanel();
    // call numpad on mobile devices
    App.setUpMobileNumericInput(App.jPriceInput);

    // registry session means a session when user types in prices with both physical keyboard and virtual keyboard
    // used to handle multiple articles in sale list
    App.isInRegistrySession = true/*$("#registry-session")*/;

    // reset checkout
    var jDiscardSale = $("#discard-sale");
    jDiscardSale.click(function () {
        App.discardSale(false);
    });

    // Price input accepts only numeric values, also only reacts to enter and backspace
    App.jPriceInput.keydown(function (e) {
        return App.checkPriceInput(e);
    }).blur(function () {
        return App.correctPriceInput();
    }).click(function () {
        App.jPriceInput.val("");
        App.isInRegistrySession = false/*.text("0")*/;
    }).focus(function () {
        App.jPriceInput.val("");
        App.isInRegistrySession = false/*.text("0")*/;
    });

    // generate sale groups and quick sale
    var btns = App.buttons;
    var sg = $("#sale-groups");
    var sgContent = "";
    var nSgs = btns.saleGroups.length;
    for (var i = 0; i < nSgs; i++) {
        sgContent += $("<button>", {
            class: "sg",
            "sg-id": "sg" + i,
            "sg-tax": btns.saleGroups[i].tax,
            "sg-group": btns.saleGroups[i].group,
            text: btns.saleGroups[i].text,
            style: "background-color: #" + btns.saleGroups[i].bg
        }).prop("outerHTML");
    }
    sg.append(sgContent);
    App.bindSaleGroups(sg);

    var tabsContainer = $("#tabs");
    var tabNavsContainer = $("#tab-navs");
    var tabs = App.buttons.tabs;
    var nTabs = tabs.length;
    var tabsContent = "";
    var tabNavsContent = [];
    for (var i = 0; i < nTabs; i++) {
        var qss = tabs[i].quickSales;
        var nQs = qss.length;
        tabsContent += '<div class="quick-sales'
                + (i === 0 ? ' activeTab' : '')
                + '">';
        for (var j = 0; j < nQs; j++) {
            var t = qss[j];
            tabsContent +=
                    '<div class="qs-item">\
                        <button style="background-color:#' + t.bg + '">' + t.text + '</button>\
                        <div class="qs-id">qs-t' + (i + 1) + "-" + j + '</div>\
                        <div class="qs-price">' + t.price + ' ' + App.settings.currency.symbol + '</div>\
                        <div class="qs-group">' + t.group + '</div>\
                        <div class="qs-tax">' + t.tax + '</div>\
                        <div class="qs-tags">' + t.tags + '</div>\
                        <div class="qs-desc">' + t.desc + '</div>\
                    </div>'
                    ;
        }
        tabsContent += '</div>';
        tabNavsContent += '<div class="tab-nav'
                + (i === 0 ? ' activeTab' : '')
                + '">' + tabs[i].name + '</div>';
    }
    tabsContainer.append(tabsContent);
    App.bindQuickSales(tabsContainer);
    tabNavsContainer.append(tabNavsContent);

    var tabQs = tabsContainer.find(".quick-sales");
    var tabNavs = tabNavsContainer.find(".tab-nav");
    tabNavs.each(function (index) {
        var t = $(this);
        t.click(function () {
            tabNavs.each(function () {
                $(this).removeClass("activeTab");
            });
            t.addClass("activeTab");
            tabQs.each(function () {
                $(this).removeClass("activeTab");
            });
            tabQs.eq(index).addClass("activeTab");
        });
    });

    // bind control panel buttons
    $("#logo > .logo").click(function () {
        App.jControlPanel.addClass("visible");
    });
    $("#cp-header > .close, #cp-header > .logo, #main").click(function () {
        App.jControlPanel.removeClass("visible");
    });

    $("#subtotal").click(function () {
        if (App.jSaleList.find(".sale-item").size()) {
            App.recalculateTotalCost();
            App.jPayAmount.addClass("checked");
            App.beep();
        }
    });

    // bind pay button to proceed to payment, generate payment box
    $("#pay").click(function () {
        if (App.jSaleList.find(".sale-item").size() < 1) {
            return false;
        }
        App.jPriceInput.val("");
        //creating payment box
        var paymentBox = $("<div>").attr("id", "payment-box")
                .click(function (e) {
                    e.stopPropagation();
                });
        $("<div>").addClass("pb-header")
                .append($("<div>").addClass("pb-title").text("Payment"))
                .append($("<button>").addClass("pb-close").click(function () {
                    App.closeCurtain();
                })).appendTo(paymentBox);
        var paymentBody = $("<div>").addClass("pb-body");
        var receipt = $("<div>").addClass("receipt");
        /* var receiptHeader = $("<div>").addClass("receipt-header");
         $("<div>").addClass().text("Receipt Preview").appendTo(receipt);*/
        var rh = $(
                '<div class="receipt-header">\
                    <div class="preview">' + 'Receipt Preview' + '</div>\
                    <div class="company-name">' + 'Your Convenient Store' + '</div>\
                    <div class="address-1">' + 'Sheppherd Bush Rd 42' + '</div>\
                    <div class="address-2">' + '4WE520 London' + '</div>\
                    <div class="receipt-row">\
                        <div class="tin">' + 'TIN: ' + '12345678' + '</div>\
                        <div class="vat">' + 'VAT Reg No. ' + 'CZ1234567890' + '</div>\
                    </div>\
                </div>');
        App.receiptNumber = $("<div>").attr("id", "receipt-number").appendTo(rh);
        App.receiptNumber.text("Receipt No. " + 123);
        receipt.append(rh);
        var receiptBody = $("<ul>").addClass("receipt-body");
        var taxValues = {};
        var nTrs = App.settings.tax_rates.length;
        for (var i = 0; i < nTrs; i++) {
            taxValues[App.settings.tax_rates[i]] = {tax: null, total: null};
        }
        var totalItems = 0;
        App.jSaleList.find(".sale-item").each(function () {
            var t = $(this);
            var q = t.find(".si-quantity").val();
            totalItems += parseFloat(q);
            var p = t.find(".si-price").text();
            var n = t.find(".si-name").val();
            var thisTotal = t.find(".si-total").text();
            var receiptItem = $("<li>").addClass("receipt-item")
                    .append($("<div>").addClass("ri-n").text(n))
                    .append($("<div>").addClass("ri-v")
                            .append($("<div>").addClass("ri-q").text(q))
                            .append($("<div>").addClass("ri-x"))
                            .append($("<div>").addClass("ri-p").text(p))
                            .append($("<div>").addClass("ri-tt").text(thisTotal))
                            );
            receiptBody.append(receiptItem);

            var taxRate = t.find(".si-tax").text();
            taxValues[taxRate].tax += (parseFloat(thisTotal) * parseFloat(taxRate) / 100);
            taxValues[taxRate].total += parseFloat(thisTotal);
        });

        var total = App.jPayAmount.text().replace(/,/g, ".").replace(/[^\d\.\-]/g, "");
        receiptBody.appendTo(receipt);

        //creating receipt summary
        var receiptSummary = $("<div>").attr("id", "receipt-summary");
        $("<div>").attr("id", "rs-total-items")
                .append($("<div>").addClass("rs-label").text("Total items:"))
                .append($("<div>").addClass("rs-value").text(totalItems))
                .appendTo(receiptSummary);
        $("<div>").attr("id", "rs-total")
                .append($("<div>").addClass("rs-label").text("Total amount:"))
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
        $("<div>").attr("id", "taxes-label").text("VAT summary:").appendTo(receiptSummary);
        $("<div>").attr("id", "tax-header")
                .append($("<div>").addClass("th-rate").text("Rate"))
                .append($("<div>").addClass("th-net").text("Net"))
                .append($("<div>").addClass("th-value").text("Tax"))
                .append($("<div>").addClass("th-total").text("Total"))
                .appendTo(receiptSummary);

        // calculate taxes
        var taxRates = Object.keys(taxValues);
        var nTrsv = taxRates.length;
        for (var i = 0; i < nTrsv; i++) {
            if (taxValues[taxRates[i]].tax !== null) {
                $("<div>").addClass("rs-tax")
                        .append($("<div>").addClass("rs-tax-rate").text(taxRates[i] + "%"))
                        .append($("<div>").addClass("rs-tax-net").text((taxValues[taxRates[i]].total.toFixed(2) - taxValues[taxRates[i]].tax.toFixed(2)).toFixed(2)))
                        .append($("<div>").addClass("rs-tax-tax").text(taxValues[taxRates[i]].tax.toFixed(2)))
                        .append($("<div>").addClass("rs-tax-total").text(taxValues[taxRates[i]].total.toFixed(2)))
                        .appendTo(receiptSummary);
            }
        }
        receiptSummary.appendTo(receipt);
        App.receiptTime = $("<div>").attr("id", "receipt-time").text(App.getDate());
        App.startReceiptTime();
        $("<div>").addClass("receipt-row")
                .append($("<div>").addClass("receipt-clerk").text("Checked: Joe Car"))
                .append(App.receiptTime).appendTo(receipt);
        $("<div>").addClass("receipt-gratitude").text("Thank you for stopping by!").appendTo(receipt);

        //creating receipt footer
        $("<div>").addClass("receipt-footer").text("EnterpriseApps").appendTo(receipt);

        //creating payment section
        var payment = $("<div>").attr("id", "payment");
        App.jCashInput = $("<input>");
        //$("<div>").addClass("cash-pay-label").text("Amount to pay").appendTo(payment);
        $("<div>").attr("id", "cash-pay-topay").text("Total: " + total + " " + App.settings.currency.symbol)
                .click(function () {
                    App.jCashInput.val(total).blur();
                }).appendTo(payment);

        //var quickCashLabel = $("<div>").addClass("cash-quick-label").text("Quick cash payment");
        //quickCashLabel.appendTo(payment);
        var quickCash = $("<div>").addClass("cash-quick");
        var cashChange = $("<div>").attr("id", "cash-change");
        App.changeAmount = 0;
        var qcs = [100, 200, 500, 1000, 2000, 5000];
        var nQcs = qcs.length;
        for (var i = 0; i < nQcs; i++) {
            $("<button>").addClass("cash-button").text(qcs[i])
                    .click(function () {
                        var t = $(this);
                        var cash = t.text();
                        App.jCashInput.val(cash + "00").blur();
                    })
                    .appendTo(quickCash);
        }
        quickCash.appendTo(payment);

        //var payForm = $("<div>").addClass("pay-form");
        $("<div>").addClass("cash-pay-label").text("Cash").appendTo(payment);
        App.jCashInput.attr("id", "cash-input")
                .attr("placeholder", "0.00")
                .attr("maxlength", "9")
                .val(total)
                .keydown(function (e) {
                    e.stopPropagation();
                    if (e.keyCode === 27) {
                        App.jCashInput.blur();
                        return true;
                    }
                    return App.checkNumericInput(e, this);
                })
                .blur(function () {
                    var t = $(this);
                    var p = t.val();
                    var correctValue = App.correctPrice(p);
                    t.val(correctValue);
                    if (!correctValue || !/^\-?\d+\.\d{2}$/g.test(correctValue) || parseFloat(correctValue) < parseFloat(total)) {
                        t.addClass("invalid");
                        payment.find("#cash-confirm").addClass("disabled");
                        return true;
                    }
                    t.removeClass("invalid");
                    payment.find("#cash-confirm").removeClass("disabled");
                    App.changeAmount = (parseFloat(t.val()) - parseFloat(total)).formatMoney();
                    cashChange.text("Change: " + App.changeAmount + " " + App.settings.currency.symbol);
                    paymentBox.find("#rs-tender .rs-value").text(t.val());
                    paymentBox.find("#rs-change .rs-value").text(App.changeAmount);
                })
                .focus(function () {
                    $(this).select();
                }).appendTo(payment);
        //payForm.appendTo(payment);
        App.setUpMobileNumericInput(App.jCashInput);
        cashChange.text("Change: " + Number(0).formatMoney() + " " + App.settings.currency.symbol).appendTo(payment);

        var receiptPrinted = false;

        $("<button>").attr("id", "cash-confirm").text("CONFIRM PAYMENT").click(function () {
            var t = $(this);
            if (!t.hasClass("disabled")) {
                clearInterval(App._receiptTimeInterval);
                payment.children().remove();
                App.discardSale(true);
                $("<div>").addClass("pc-label").text("Sale complete!").appendTo(payment);
                if (App.changeAmount !== "0.00") {
                    $("<div>").addClass("pc-change").text("Issue change of " + App.changeAmount + " " + App.settings.currency.symbol).appendTo(payment);
                }
                $("<button>").attr("id", "print-receipt").text("Print receipt").click(function () {
                    window.print();
                    receiptPrinted = true;
                }).appendTo(payment);
                var emailReceipt = $("<div>").addClass("email-receipt").appendTo(payment);
                var emailInput = $("<input>").attr("id", "email-input").focus(function () {
                    emailInput.removeClass("invalid");
                    if (emailInput.val() !== "@") {
                        emailInput.val("@");
                        emailInput.select();
                    }
                }).val("@").appendTo(emailReceipt);
                $("<button>").attr("id", "email-send").text("Email receipt").click(function () {
                    var recipient = emailInput.val();
                    if (App.isValidEmail(recipient)) {
                        $(this).text("Email sent").addClass("sent").off();
                        emailInput.remove();
                    } else {
                        emailInput.addClass("invalid").val("Invalid email");
                    }
                }).appendTo(emailReceipt);
                emailReceipt.appendTo(payment);
                //payment.append(paymentComplete);
                $("<button>").attr("id", "done-payment").text("Done").click(function () {
                    if (!receiptPrinted) {
                        window.print();
                    }
                    App.closeCurtain();
                    App.jPriceInput.focus();
                }).appendTo(payment);
            }
        }).appendTo(payment);
        payment.appendTo(paymentBody);
        $("<div>").addClass("receipt-container").append(receipt).appendTo(paymentBody);

        paymentBody.appendTo(paymentBox);

        App.showInCurtain(paymentBox);
        App.jCashInput.focus();
        App.beep();
    });

    //populating articles for scanning    
    var articles = App.catalog.articles;
    var nArticles = articles.length;
    for (var i = 0; i < nArticles; i++) {
        articles[i].id = i;
    }
    articles.sort(function (a, b) {
        return a.ean < b.ean ? -1 : 1;
    });
    App.jSearchBox = App.jLiveSearch.find("#search");
    App.jSearchBox.keyup(function (e) {
        var t = $(this);
        if (e.keyCode === 13) {
            var filter = t.val();
            var i = articles.binaryIndexOf(filter);
            if (i >= 0) {
                var item = articles[i];
                var mult = App.getMultiplicationNumber();
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
                t.removeClass("not-found");
                t.attr("placeholder", "PLU");

                App.isInRegistrySession = false/*.text("0")*/;
                App.jPriceInput.blur();
                App.jPriceInput.val(item.price);
            } else {
                //t.addClass("not-found");
                t.attr("placeholder", "PLU not found");
                //App.makeWarning("This EAN " + filter + " is not defined");
            }
            t.val("");
        } else if (e.keyCode === 27) {
            t.blur();
        }
    }).keydown(function (e) {
        e.stopPropagation();
    }).click(function () {
        $(this).removeClass("not-found");
        $(this).attr("placeholder", "PLU");
    }).focus(function () {
        $(this).removeClass("not-found");
        $(this).attr("placeholder", "PLU");
    });

    $(document).scannerDetection(function (s) {
        clearTimeout(App._scannerTimingOut);
        App.jSearchBox.blur();
        App.justUsedScanner = true;
        App._scannerTimingOut = setTimeout(function () {
            App.justUsedScanner = false;
        }, App._timeBetweenConsecutiveScannings);
        App.closeCurtain();
        App.jSearchBox.val(s);
        App.jSearchBox.trigger(App.simulateEnterKeyup());
        App.isInRegistrySession = true/*.text("1")*/;
    });

    App.signout = $("#sign-out").click(function () {
        App.showLoading();
        $.ajax({
            type: "GET",
            url: "/logout"
        }).done(function () {
            App.renderSignin();
        }).fail(function () {
            //App.renderLogin();
            App.closeCurtain();
            App.showWarning("Unable to logout. Please check your connection");
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

// get data for web register
App.initWebRegister = function () {
    $.when(
            $.getJSON("/api/catalog", function (catalog) {
                App.catalog = catalog;
            }),
            $.getJSON("/api/settings", function (settings) {
                App.settings = settings;
            }),
            $.getJSON("/api/buttons", function (buttons) {
                App.buttons = buttons;
            })
            ).then(function () {
        App.renderWebRegister();
    });
};

// show loading spin when making requests
App.showLoading = function () {
    App.showInCurtain(App.loadingScreen);
};

// check for valid email syntax, allows guest as valid
App.isValidEmail = function (email) {
    if (["guest"].indexOf(email) >= 0) {
        return true;
    }
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

// render signup
App.renderSignup = function () {
    var signupDOM =
            '<div class="center-box">\
                <div class="form-header">Welcome to OPS</div>\
                <form id="sign-up" action="" method="POST">\
                    <div class="form-label">CREATE A NEW STORE</div>\
                    <input id="username" type="text" placeholder="EMAIL" required>\
                    <input id="password" type="password" placeholder="PASSWORD" pattern=".{5,}" title="Password must be at least 5 characters long" required>\
                    <input id="confirm" type="password" placeholder="CONFIRM PASSWORD" pattern=".{5,}" title="Password must be at least 5 characters long" required>\
                    <input id="name" type="text" placeholder="Name" required>\
                    <input id="tin" type="text" placeholder="Taxpayer Identification Number" pattern="\\d{4,10}" title="Invalid TIN. Example: 12345678" required>\
                    <input id="vat" type="text" placeholder="Value Added Tax Number" pattern="CZ\\w{4,10}" title="Invalid VAT. Example: CZ0123456789" required>\
                    <input id="street" type="text" placeholder="Street and Property Number" required>\
                    <input id="city" type="text" placeholder="City" required>\
                    <input id="zip" type="text" placeholder="ZIP Code" required>\
                    <input id="country" type="text" placeholder="Country" required>\
                    <input id="phone" type="text" placeholder="Phone Number" pattern="\\d{9}" title="9 Digits Phone Number" required>\
                    <select id="currency">\
                        <option data=\'{"code":"CZK","symbol":"Kč"}\' selected>CZK</option>\
                        <option data=\'{"code":"SKK","symbol":"Sk"}\'>SKK</option>\
                    </select>\
                    <input type="submit" value="SIGN UP">\
                    <div id="form-help">\
                        <div id="signin">Back to sign in</div>\
                    </div>\
                </form>\
                <div class="form-footer">Powered by EnterpriseApps</div>\
             </div>'
            ;
    App.jAppContainer.html(signupDOM);

    var form = $("#sign-up");
    form.find("#signin").click(function () {
        App.renderSignin();
    });
    form.submit(function (e) {
        e.preventDefault();
        var username = $("#username");
        if (!App.isValidEmail(username.val())) {
            App.showWarning("<strong>" + username.val() + "</strong> is not a valid emaill address!");
            return false;
        }
        var password = $("#password");
        var confirm = $("#confirm");
        if (password.val() !== confirm.val()) {
            App.showWarning("Passwords do not match!");
            return false;
        }
        var signupRequest = {
            email: username.val(),
            password: password.val(),
            name: $(this).find("#name").val(),
            tin: $(this).find("#tin").val(),
            vat: $(this).find("#vat").val(),
            street: $(this).find("#street").val(),
            city: $(this).find("#city").val(),
            zip: $(this).find("#zip").val(),
            country: $(this).find("#country").val(),
            phone: $(this).find("#phone").val(),
            currency: $(this).find("#currency").find(":selected").attr("data")
        };
        App.showLoading();
        $.ajax({
            type: "POST",
            url: "/signup",
            dataType: "json",
            data: signupRequest
        }).done(function (resp) {
            if (resp.success) {
                App.renderSignin();
                App.showWarning("Thank you for creating an account<br>Please check your inbox at <strong>" + resp.msg + "</strong> to complete the registration");
            } else {
                App.closeCurtain();
                App.showWarning("Unable to create account<br><strong>" + resp.msg + "</strong><br>Please let us know at <a href='mailto:info.enterpriseapps@gmail.com'>info.enterpriseapps@gmail.com</a>");
            }
        }).fail(function (resp) {
            App.closeCurtain();
            var msg = "Incorrect username and/or password";
            if (resp.status === 0) {
                msg = "Network error. Please check your internet connection";
            }
            App.showWarning(msg);
        });
    });
};

// render login view
App.renderSignin = function () {
    App.closeCurtain();
    var signinDOM =
            '<div class="center-box">\
                <div class="form-header">Welcome to OPS</div>\
                <form id="sign-in" action="" method="POST">\
                    <div class="form-label">OPEN YOUR STORE</div>\
                    <input id="username" type="text" placeholder="EMAIL">\
                    <input id="password" type="password" placeholder="PASSWORD">\
                    <input type="submit" value="SIGN IN">\
                    <div id="form-help">\
                        <div id="signup">Sign up</div>\
                        <div id="forgot">Forgot your password?</div>\
                    </div>\
                </form>\
                <div class="form-footer">Powered by EnterpriseApps</div>\
             </div>'
            ;
    App.jAppContainer.html(signinDOM);
    var form = $("#sign-in");
    form.find("#forgot").click(function () {
        $(this).text("How unfortunate");
    });
    form.find("#signup").click(function () {
        App.renderSignup();
    });
    form.submit(function (e) {
        e.preventDefault();
        var t = $(this);
        var username = t.find("#username").val();
        var password = t.find("#password").val();
        if (!App.isValidEmail(username) || !password.length) {
            App.showWarning("Please enter your email and password to sign in");
        } else {
            App.showLoading();
            $.ajax({
                type: "POST",
                url: "/auth",
                dataType: "json",
                data: {
                    username: username || " ",
                    password: password || " "
                }
            }).done(function (resp) {
                if (resp.isAuthenticated) {
                    App.initWebRegister();
                } else {
                    alert("Wrong credentials");
                }
            }).fail(function (resp) {
                App.closeCurtain();
                var msg = "Incorrect username and/or password";
                if (resp.status === 0) {
                    msg = "Network error. Please check your internet connection";
                }
                App.showWarning(msg);
            });
        }

        t.find("#password").val("");
    });
};

// after print remove the payment box
(function () {

    var beforePrint = function () {

    };

    var afterPrint = function () {
        //App.closeCurtain();
    };

    if (window.matchMedia) {
        var mediaQueryList = window.matchMedia("print");
        mediaQueryList.addListener(function (mql) {
            if (mql.matches) {
                beforePrint();
            } else {
                afterPrint();
            }
        });
    }

    window.onbeforeprint = beforePrint;
    window.onafterprint = afterPrint;

}());

App.createControlPanel = function () {
    var cpContent = $(
            '<div class="cp-item" id="sale-history">Sales History</div>\
             <div class="cp-item" id="acc-settings">Account Settings</div>\
             <div class="cp-item" id="sta-settings">Staff Settings</div>\
             <div class="cp-item" id="pos-settings">Point of Sale Settings</div>\
             <div class="cp-item" id="plu-settings">Edit PLU Articles</div>\
             <div class="cp-item" id="sgs-settings">Edit Sale Groups</div>\
             <div class="cp-item" id="qss-settings">Edit Quick Sales</div>\
             <div class="cp-item" id="rec-settings">Edit Receipt</div>'
            );
    App.cpBody.append(cpContent);
    App.bindControlPanel();
};

App.renderAccountSettings = function () {
    var accDOM =
            '<div class="center-box">\
                <div class="form-header">Account Settings</div>\
                <form id="change-password" action="" method="POST">\
                    <div class="form-label">CHANGE YOUR PASSWORD</div>\
                    <input id="old-password" type="password" pattern=".{5,}" title="Password must be at least 5 characters long" placeholder="OLD PASSWORD">\
                    <input id="new-password" type="password" pattern=".{5,}" title="Password must be at least 5 characters long" placeholder="NEW PASSWORD">\
                    <input id="con-password" type="password" pattern=".{5,}" title="Password must be at least 5 characters long" placeholder="CONFIRM PASSWORD">\
                    <input type="submit" value="SUBMIT">\
                </form>\
             </div>';
    App.cpBody.html(accDOM);

    var goBack = $('<div id="go-back">Go back</div>').click(function () {
        App.cpBody.html("");
        App.createControlPanel();
    });

    App.cpBody.find(".center-box").prepend(goBack);
    var minPasswordLength = 5;
    App.cpBody.find("form#change-password").submit(function (e) {
        e.preventDefault();
        var t = $(this);
        var oldPass = t.find("#old-password");
        var newPass = t.find("#new-password");
        var conPass = t.find("#con-password");
        if (newPass.val().length < minPasswordLength
                || conPass.val().length < minPasswordLength
                || oldPass.val().length < minPasswordLength) {
            App.showWarning("The minimum length for a password is " + minPasswordLength + " characters");
            return false;
        }
        if (newPass.val() !== conPass.val()) {
            App.showWarning("Passwords do not match");
            return false;
        }
        App.showLoading();
        $.ajax({
            type: "POST",
            url: "changepassword",
            dataType: "json",
            data: {
                oldpassword: oldPass.val(),
                newpassword: newPass.val()
            }
        }).done(function (resp) {
            App.closeCurtain();
            if (resp.passwordChanged === true) {
                App.showWarning("Password was successfully changed");
            } else {
                App.showWarning("Incorrect password");
            }
        }).fail(function (resp) {
            App.closeCurtain();
            var msg = "The password is invalid";
            if (resp.status === 0) {
                msg = "Network error. Please check your internet connection";
            }
            App.showWarning(msg);
        });
        oldPass.val("");
        newPass.val("");
        conPass.val("");
    }).click(function (e) {
        e.stopPropagation();
    });
};

App.bindControlPanel = function () {
    App.cpBody.find(".cp-item").each(function () {
        var t = $(this);
        var id = t.attr("id");
        switch (id) {
            case "sale-history":
                t.click(function () {
                    t.text("Not yet available");
                });
                break;
            case "acc-settings":
                t.click(App.renderAccountSettings);
                break;
            case "sta-settings":
                t.click(function () {
                    t.text("Not yet available");
                });
                break;
            case "pos-settings":
                t.click(function () {
                    t.text("Not yet available");
                });
                break;
            case "plu-settings":
                t.click(function () {
                    t.text("Not yet available");
                });
                break;
            case "sgs-settings":
                t.click(function () {
                    t.text("Not yet available");
                });
                break;
            case "qss-settings":
                t.click(function () {
                    t.text("Not yet available");
                });
                break;
            case "rec-settings":
                t.click(function () {
                    t.text("Not yet available");
                });
                break;
            default:

        }
    });
};