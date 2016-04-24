
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
Array.prototype.binaryIndexOf = function (field, needle) {
    "use strict";

    var minIndex = 0;
    var maxIndex = this.length - 1;
    var currentIndex;
    var currentElement;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = this[currentIndex];

        if (currentElement[field] < needle) {
            minIndex = currentIndex + 1;
        }
        else if (currentElement[field] > needle) {
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

App.correctTime = function (s) {
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

App.createDateObject = function (s) {
    var now = null;
    if (s) {
        now = new Date(s);
    } else {
        now = new Date();
    }
    return {
        day: App.week[now.getDay()].short,
        date: App.correctTime(now.getDate()),
        month: App.correctTime(now.getMonth() + 1),
        year: App.correctTime(now.getFullYear()),
        hh: App.correctTime(now.getHours()),
        mm: App.correctTime(now.getMinutes()),
        ss: App.correctTime(now.getSeconds())
    };
};

App.getDate = function (s) {
    var d = App.createDateObject(s);
    return d.day + " " + d.date + "/" + d.month + "/" + d.year + " " + d.hh + ":" + d.mm + ":" + d.ss;
};

App.getDatePrefix = function () {
    var d = App.createDateObject();
    return d.year + "" + d.month + "" + d.date;
};

// start counting time until sale is confirmed
App.startReceiptTime = function () {
    clearInterval(App._receiptTimeInterval);
    App._receiptTimeInterval = setInterval(function () {
        App.receiptTime.text(App.getDate());
    }, 500);
};

App.sortByEAN = function (a, b) {
    return a.ean < b.ean ? -1 : 1;
};

// plays beep sound
App.beep = function () {
    if (!App.isMuted) {
        App.beeper.pause();
        App.beeper.currentTime = 0;
        App.beeper.play();
    }
};

// corrects input price value, eg. adds decimal points, reformats bad inputs
App.correctPrice = function (pr) {
    var p = pr;
    var dotIndex = p.indexOf(".");
    if (dotIndex > 0) {
        var intPart = p.slice(0, dotIndex);
        var decPart = p.slice(dotIndex + 1, p.length);        
        if (decPart.length > 2) {
            decPart = decPart.slice(0, 2);
        } else if (decPart.length > 1) {
            
        } else if (decPart.length > 0) {
            decPart = decPart + "0";
        } else {
            decPart = decPart + "00";            
        }        
        return intPart + "." + decPart;
    }
    p = pr.replace(/\./g, "");
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
    if (!/^\-?\d+\*?(\d+)?\.?(\d+)?$/g.test(p) || p === "-") {
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
    if (e.keyCode === 27) { // allow esc
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
    if (e.keyCode === 110) {        
        if (App.jPriceInput.val().length === 0) {
            return false;
        }
        if (App.jPriceInput.val().indexOf(".") < 0) {
            //p.attr("maxlength", 9);
            return true;
        }
        return false;
    }
    // prevent other non-digit key press
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
        //input.attr("type", "number");
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
        }).append(show)/*.hide()*/.appendTo(App.jAppContainer)/*.fadeIn(App.getAnimationTime())*/;
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
                $("<div>").addClass("db-tax").text("Tax: " + tax + "%").appendTo(lbInfo);
                $("<div>").addClass("db-tags").text("Tags: " + tags).appendTo(lbInfo);
                $("<div>").addClass("db-desc").text("Description: " + desc).appendTo(lbInfo);
                lbInfo.appendTo(lbBody);
                //$("<div>").addClass("db-img").appendTo(lbBody);

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
        v = v.replace(/[\s]+/g, "");
        var a = v.indexOf("*");
        var price = a >= 0 ? v.slice(a + 1, v.length) : v;
        if (price.length === 0 || parseInt(price) === 0 || v === "-") {
            App.jPriceInput.val("");
            App.showWarning("You must enter a price");
            return false;
        }
        var mult = App.getMultiplicationNumber();

        var sign = "";
        if (price.charAt(0) === "-") {
            price = price.slice(1);
            sign = "-";
        }
        var correctValue = App.correctPrice(price);
        if (!correctValue) {
            App.jPriceInput.val("");
            return false;
        }

        price = App.correctPrice(price);
        App.jPriceInput.val(sign + price);

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
        var price = t.find(".qs-price").text().replace(/[^\-\d\.]/g, "");
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
                    <div id="cp-link" title="Open control panel"></div>\
                    <div id="muter" title="Mute beep sound"></div>\
                    <div id="profile">' + (App.currentEmployee.name || 'LOGIN') + '</div>\
                    <div id="logout">Log out</div>\
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
                   <div id="keyboard" class="keyboard">\
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
                        <button id="btndot">.</button>\
                        <button id="btn0">0</button>\
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
            case "btndot": // decimal point
                if (p.length > 0 && p.indexOf(".") < 0) {
                    activeInput.val(p + ".");
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

App.loadLocalStorage = function () {
    if (localStorage.hasOwnProperty("isMuted")) {
        App.isMuted = localStorage.isMuted === "true";
    } else {
        localStorage.isMuted = false;
        App.isMuted = false;
    }
};

// initializes some global variables and functions
App.init = function () {    
    /**********************************************************/
    App.loadLocalStorage();  // localStorage to be implemented
    /**********************************************************/
    
    App.jAppContainer = $("#app");
    App.loadingScreen = $('<div class="loading"></div>');
    App.curtain = null;
    App.justUsedScanner = false;
    App._timeBetweenConsecutiveScannings = 2000;
    // esc to remove curtain, focus price input after hitting enter if price input is not yet focused
    $(document).keydown(function (e) {
        if (e.keyCode === 27) {
            App.closeCurtain();
        } else if (e.keyCode === 13) {
            if (App.jControlPanel && !App.jControlPanel.hasClass("visible")) {
                if (!App.curtain && App.jPriceInput && !App.justUsedScanner) {
                    App.jPriceInput.focus();
                } else if (App.jCashInput) {
                    App.jCashInput.focus();
                }
            }
        }
        return true;
    });
    /*$(window).on("beforeunload", function () {
     return "You are about to close this application. Any unsaved work will be lost!";
     });*/
};

//
App.renderSaleGroupsButtons = function () {
    var currentSaleGroups = App.buttons.saleGroups;
    var sgContent = "";
    var nSgs = currentSaleGroups.length;
    for (var i = 0; i < nSgs; i++) {
        sgContent += $("<button>", {
            class: "sg",
            "sg-id": "sg" + i,
            "sg-tax": currentSaleGroups[i].tax,
            "sg-group": currentSaleGroups[i].group,
            text: currentSaleGroups[i].group.toUpperCase(),
            style: "background-color: #" + currentSaleGroups[i].bg
        }).prop("outerHTML");
    }
    App.sg.html(sgContent);
    App.bindSaleGroups(App.sg);
};

// render web register view
App.renderWebRegister = function () {
    App.closeCurtain();
    App.createWebRegisterDOM();
    App.bindKeyboard();
    App.jMain = $("#main");
    App.jSiPlaceholder = $("#si-placeholder");
    App.beeper = new Audio("../sound/beep2.mp3");
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
    // call numpad on mobile devices // temporary disabled because of decimal point ATTENTION!!!!
    App.setUpMobileNumericInput(App.jPriceInput);

    // registry session means a session when user types in prices with both physical keyboard and virtual keyboard
    // used to handle multiple articles in sale list
    App.isInRegistrySession = true/*$("#registry-session")*/;    
    
    var muter = $("#muter");
    if (App.isMuted) {
        muter.addClass("muted");
    } else {
        muter.addClass("unmuted");        
    }
    muter.click(function () {
        if (App.isMuted) {
            muter.removeClass("muted");
            muter.addClass("unmuted");
            localStorage.isMuted = false;
            App.isMuted = false;
        } else {            
            muter.removeClass("unmuted");
            muter.addClass("muted");
            localStorage.isMuted = true;
            App.isMuted = true;
        }
    });
    
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

    // generate sale groups
    App.sg = $("#sale-groups");
    App.renderSaleGroupsButtons();

    // generate quicksale tabs
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
    $("#logo > .logo, #cp-link").click(function () {
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
    
    var currentReceipt = {};
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
        var receiptHeader = $(
                '<div class="receipt-header">\
                    <div class="preview">' + 'Receipt Preview' + '</div>\
                    <div class="company-name">' + App.settings.name + '</div>\
                    <div class="address-1">' + App.settings.address.street + '</div>\
                    <div class="address-2">' + App.settings.address.zip + ' ' + App.settings.address.city + '</div>\
                    <div class="receipt-row">\
                        <div class="tin">' + 'TIN: ' + App.settings.tin + '</div>\
                        <div class="vat">' + 'VAT: ' + App.settings.vat + '</div>\
                    </div>\
                </div>');
        $("<div>").addClass("receipt-custom-header").html(App.receipt.header).appendTo(receiptHeader);
        $("<div>").attr("id", "receipt-number").text("Receipt #" + App.getDatePrefix() + App.sales.receipts.length).appendTo(receiptHeader);
        receipt.append(receiptHeader);
        var receiptBody = $("<ul>").addClass("receipt-body");
        var taxValues = {};
        var nTrs = App.settings.tax_rates.length;
        for (var i = 0; i < nTrs; i++) {
            taxValues[App.settings.tax_rates[i]] = {tax: null, total: null};
        }
        var totalItems = 0;
        currentReceipt = {
            number: App.getDatePrefix() + App.sales.receipts.length,
            date: null,
            clerk: App.currentEmployee.name,
            items: [],
            confirmed: false
        };
        
        App.jSaleList.find(".sale-item").each(function () {
            var t = $(this);
            var q = t.find(".si-quantity").val();
            totalItems += parseFloat(q);
            var p = t.find(".si-price").text();
            var n = t.find(".si-name").val();
            var taxRate = t.find(".si-tax").text();
            
            currentReceipt.items.push({
                name: n,
                price: p,
                quantity: parseInt(q),
                tax_rate: parseInt(taxRate)
            });
    
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
        
        $("<div>").addClass("receipt-clerk").text("Checked: " + App.currentEmployee.name).appendTo(receipt);
        App.receiptTime = $("<div>").attr("id", "receipt-time").text(App.getDate()).appendTo(receipt);        
        App.startReceiptTime();
        
        $("<div>").addClass("receipt-gratitude").text(App.receipt.footer).appendTo(receipt);

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
            t.off();
            if (!t.hasClass("disabled")) {
                clearInterval(App._receiptTimeInterval);

                currentReceipt.date = new Date();
                currentReceipt.items = JSON.stringify(currentReceipt.items);
                currentReceipt.tendered = App.jCashInput.val();
                $.ajax({
                    type: "POST",
                    url: "/mod/addsale",
                    dataType: "json",
                    data: currentReceipt
                }).done(function (resp) {
                    if (resp.success) {
                        //App.sales.receipts.push(currentReceipt);
                        App.sales.receipts.push(resp.msg);

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
                        var sendButton = $("<button>").attr("id", "email-send").text('Email receipt').click(function () {
                            var recipient = emailInput.val();
                            if (App.isValidEmail(recipient)) {
                                currentReceipt.recipient = recipient;
                                currentReceipt.shop =
                                        App.settings.name + "\n"
                                        + App.settings.address.street + "\n"
                                        + App.settings.address.city + " "
                                        + App.settings.address.zip + " "
                                        + App.settings.address.country + "\n"
                                        + "TIN: " + App.settings.tin + "\n"
                                        + "VAT: " + App.settings.vat + "\n"
                                        + "Phone: " + App.settings.phone;
                                sendButton.html('<div class="mi-loader loading"></div>');
                                $.ajax({
                                    type: "POST",
                                    url: "/mod/mailreceipt",
                                    dataType: "json",
                                    data: currentReceipt
                                }).done(function (resp) {
                                    if (resp.success) {
                                        sendButton.off();
                                        emailInput.prop("disable", true);
                                        sendButton.html("Email sent");
                                        sendButton.addClass("sent");
                                    } else {
                                        sendButton.html("Email could not be sent. Try again");                                        
                                        console.log(resp);
                                    }
                                }).fail(function (resp) {
                                    sendButton.html("Email could not be sent. Try again");
                                    console.log(resp);
                                });
                                //App.sendMailReceipt($(this), emailInput, recipient, currentReceipt);
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
                    } else {
                        App.closeCurtain();
                        App.showWarning("Server refused to sync");
                        console.log(resp);
                    }
                }).fail(function (resp) {
                    App.closeCurtain();
                    console.log(resp);
                    App.showWarning("Sale sync failed: " + resp.status);
                });
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
    App.nArticles = articles.length;
    for (var i = 0; i < App.nArticles; i++) {
        articles[i].id = i;
    }
    articles.sort(App.sortByEAN);
    App.jSearchBox = App.jLiveSearch.find("#search");
    App.jSearchBox.keyup(function (e) {
        var t = $(this);
        if (e.keyCode === 13) {
            var needle = t.val();
            var i = articles.binaryIndexOf("ean", needle);
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

    $("#logout").click(function () {
        App.renderDashBoard();
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

//
App.createCenterBox = function (scrollable, content) {
    return '<div class="center-box' + (scrollable ? ' scrollable' : '') + '">'
            + content
            + '</div>';
};

// render dashboard view
App.renderDashBoard = function () {
    App.closeCurtain();
    var dashBoardDOM =
            '<nav>\
                <div id="logo"><div class="logo"></div></div>\
                <div id="brand">EnterpriseApps</div>\
                <div id="menu-top">\
                    <div id="profile">' + App.settings.name + '</div>\
                    <div id="sign-out">Sign out</div>\
                </div>\
             </nav>'
            + App.createCenterBox(false,
                '<div class="form-header">Open Cash Register</div>\
                <form id="employee-login" action="">\
                    <div class="form-label">EMPLOYEE LOGIN</div>\
                    <input id="employee-username" type="text" title="Employee username " placeholder="USERNAME">\
                    <input id="employee-pin" type="password" placeholder="PIN">\
                    <input type="submit" value="OK">\
                </form>');
    App.jAppContainer.html(dashBoardDOM);
    var form = $("#employee-login");
    var employeeUsername = form.find("#employee-username");
    form.submit(function (e) {
        e.preventDefault();
        var employeeUsername = form.find("#employee-username");
        var employeePIN = form.find("#employee-pin");
        var loggedIn = false;
        var nStaff = App.staff.length;
        for (var i = 0; i < nStaff; i++) {
            var employee = App.staff[i];
            if (employee.name === employeeUsername.val()) {
                if (employee.pin === employeePIN.val()) {
                    App.currentEmployee = employee;
                    loggedIn = true;
                    break;
                }
            }
        }
        if (!loggedIn) {
            App.showWarning("Invalid Employee Name or PIN");
        } else {
            App.renderWebRegister();
        }
    });

    $("#sign-out").click(function () {
        App.showLoading();
        $.ajax({
            type: "GET",
            url: "/signout"
        }).done(function () {
            App.renderSignin();
        }).fail(function () {
            //App.renderLogin();
            App.closeCurtain();
            App.showWarning("Unable to sign out. Please check your connection");
        });
    });
    
    employeeUsername.focus();
};

// get data for web register
App.initDashBoard = function () {
    $.when(
            $.getJSON("/api/catalog", function (catalog) {
                App.catalog = catalog;
            }),
            $.getJSON("/api/settings", function (settings) {
                App.settings = settings;
                App.staff = settings.staff;
                App.receipt = settings.receipt;
            }),
            $.getJSON("/api/buttons", function (buttons) {
                App.buttons = buttons;
            }),
            $.getJSON("/api/sales", function (sales) {
                App.sales = sales;
            })
            ).then(function () {
        App.renderDashBoard();
    });
};

// show loading spin when making requests
App.showLoading = function () {
    App.showInCurtain(App.loadingScreen);
};

// check for valid email syntax, allows guest as valid
App.emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

//
App.isValidEmail = function (email) {
    if (["guest"].indexOf(email) >= 0) {
        return true;
    }
    return App.emailRegex.test(email);
};

// render signin
App.renderSignin = function () {
    App.closeCurtain();
    var signinDOM = 
            App.createCenterBox(false,
               '<div class="form-header">Welcome to OPS</div>\
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
                <div class="form-footer">Powered by EnterpriseApps</div>');
    App.jAppContainer.html(signinDOM);
    var form = $("#sign-in");
    form.find("#forgot").click(function () {
        App.renderForgot();
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
                    //App.initWebRegister();
                    App.initDashBoard();
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

// render signup
App.renderSignup = function () {
    var signupDOM =
            App.createCenterBox(true,
               '<div class="form-header">Welcome to OPS</div>\
                <form id="sign-up" action="" method="POST">\
                    <div class="form-label">CREATE A NEW STORE</div>\
                    <input id="username" type="text" placeholder="EMAIL" required>\
                    <input id="password" type="password" placeholder="PASSWORD" pattern=".{8,128}" title="Password must be at least 8 characters long" required>\
                    <input id="confirm" type="password" placeholder="CONFIRM PASSWORD" pattern=".{8,128}" title="Password must be at least 8 characters long" required>\
                    <input id="name" type="text" placeholder="Name" pattern=".{3,100}" title="Your Best World Shop, Inc." required>\
                    <input id="tin" type="text" placeholder="Taxpayer Identification Number" pattern="\\d{8}" title="Invalid TIN. Example: 12345678" required>\
                    <input id="vat" type="text" placeholder="Value Added Tax Number" pattern="[A-Z]{2}\\d{8,10}" title="Invalid VAT. Example: CZ1234567890" required>\
                    <input id="street" type="text" placeholder="Street and Property Number" pattern=".{5,100}" title="Example: Spálená 78/12" required>\
                    <input id="city" type="text" placeholder="City" pattern=".{2,75}" title="Example: Prague" required>\
                    <input id="zip" type="text" placeholder="ZIP Code" pattern="\\w{3,10}" title="Example: 18000" required>\
                    <input id="country" type="text" placeholder="Country" pattern=".{3,75}" title="Example: Czech Republic" required>\
                    <input id="phone" type="text" placeholder="Phone Number" pattern="\\+?(\\d{3})?\\d{9}" title="9 or +12 Digits Phone Number. Example: 777666555, +420777666555" required>\
                    <select id="currency">\
                        <option data=\'{"code":"CZK","symbol":"Kč"}\' selected>CZK - Czech Koruna</option>\
                    </select>\
                    <input type="submit" value="SIGN UP">\
                    <div id="form-help">\
                        <div id="signin">Back to sign in</div>\
                    </div>\
                </form>\
                <div class="form-footer">Powered by EnterpriseApps</div>');
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
                App.showWarning("Thank you for creating an account<br>Please check your inbox at <strong>" 
                        + resp.msg 
                        + "</strong> to complete the registration");
            } else {
                App.closeCurtain();
                App.showWarning("Unable to create account<br><strong>" 
                        + resp.msg 
                        + "</strong><br>Please let us know at <a href='mailto:info.enterpriseapps@gmail.com'>info.enterpriseapps@gmail.com</a>");
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

// render forgot
App.renderForgot = function () {
    var forgotDOM =
            App.createCenterBox(false,
               '<div class="form-header">Welcome to OPS</div>\
                <form id="reset-password" action="" method="POST">\
                    <div class="form-label">RESET PASSWORD</div>\
                    <input id="username" type="text" placeholder="EMAIL" required>\
                    <input type="submit" value="SUBMIT">\
                    <div id="form-help">\
                        <div id="signin">Back to sign in</div>\
                    </div>\
                </form>\
                <div class="form-footer">Powered by EnterpriseApps</div>');
    App.jAppContainer.html(forgotDOM);

    var form = $("#reset-password");
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
        App.showLoading();
        $.ajax({
            type: "POST",
            url: "/forgot",
            dataType: "json",
            data: {
                email: username.val()
            }
        }).done(function (resp) {
            if (resp.success) {
                App.renderSignin();
                App.showWarning("A reset link has been sent to your inbox at <strong>" + resp.msg + "</strong>");
            } else {
                App.closeCurtain();
                App.showWarning("Unable to process your request<br><strong>" 
                        + resp.msg 
                        + "</strong><br>Please let us know at <a href='mailto:info.enterpriseapps@gmail.com'>info.enterpriseapps@gmail.com</a>");
            }
        }).fail(function (resp) {
            var msg = "Request failed. " + resp.status;
            if (resp.status === 0) {
                msg = "Network error. Please check your internet connection";
            }
            App.closeCurtain();
            App.showWarning(msg);
        });
    });
};

// after print remove the payment box
(function () {

    var beforePrint = function () {

    };

    var afterPrint = function () {
        if(App.jPrinterCopyReceipt) {
            App.closeCurtain();
            App.jPrinterCopyReceipt = null;            
        }
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

//--------------------------- CONTROL PANEL ----------------------------------//
App.createControlPanel = function () {
    var cpContent = '<div class="cp-item" id="sale-history">Sales History</div>\
                    <div class="cp-item" id="close-register">Close Register</div>';
    if (App.currentEmployee.role === "Admin") {
        cpContent +=
                '<div class="cp-item" id="acc-settings">Account Settings</div>\
                <div class="cp-item" id="sta-settings">Staff Settings</div>\
                <div class="cp-item" id="pos-settings">Point of Sale Settings</div>\
                <div class="cp-item" id="plu-settings">Edit PLU Articles</div>\
                <div class="cp-item" id="sgs-settings">Edit Sale Groups</div>\
                <div class="cp-item" id="qss-settings">Edit Quick Sales</div>\
                <div class="cp-item" id="rec-settings">Edit Receipt</div>';
    }
    App.cpBody.append($(cpContent));
    App.bindControlPanel();
};

App.bindControlPanel = function () {
    App.cpBody.find(".cp-item").each(function () {
        var t = $(this);
        var id = t.attr("id");
        switch (id) {
            case "sale-history":
                t.click(App.renderSaleHistory);
                break;
            case "close-register":
                t.click(function () {
                    t.text("Not available");
                });
                break;
            case "acc-settings":
                t.click(App.renderAccountSettings);
                break;
            case "sta-settings":
                t.click(App.renderStaffSettings);
                break;
            case "pos-settings":
                t.click(App.renderPOSSettings);
                break;
            case "plu-settings":
                t.click(App.renderPLUSettings);
                break;
            case "sgs-settings":
                t.click(App.renderSaleGroupsSettings);
                break;
            case "qss-settings":
                t.click(function () {
                    t.text("Not available");
                });
                break;
            case "rec-settings":
                t.click(App.renderReceiptSettings);
                break;
            default:

        }
    });
};

App.createGoBack = function (cb) {
    return $('<div id="go-back">Go back</div>').click(function () {
        if (cb) {
            cb();
        }
        App.cpBody.html("");
        App.createControlPanel();
    });
};

//--------------------------- ACCOUNT SETTINGS -------------------------------//
App.renderAccountSettings = function () {
    var accDOM =
            App.createCenterBox(false, 
               '<div class="form-header">Account Settings</div>\
                <form id="change-password" action="" method="POST">\
                    <div class="form-label">CHANGE YOUR PASSWORD</div>\
                    <input id="old-password" type="password" pattern=".{8,128}" title="Password must be at least 8 characters long" placeholder="OLD PASSWORD">\
                    <input id="new-password" type="password" pattern=".{8,128}" title="Password must be at least 8 characters long" placeholder="NEW PASSWORD">\
                    <input id="con-password" type="password" pattern=".{8,128}" title="Password must be at least 8 characters long" placeholder="CONFIRM PASSWORD">\
                    <input type="submit" value="SUBMIT">\
                </form>');
    App.cpBody.html(accDOM);

    App.cpBody.find(".center-box").prepend(App.createGoBack());
    App.cpBody.find("#change-password").submit(function (e) {
        e.preventDefault();
        var t = $(this);
        var oldPass = t.find("#old-password");
        var newPass = t.find("#new-password");
        var conPass = t.find("#con-password");
        if (newPass.val().length < 8
                || conPass.val().length < 8
                || oldPass.val().length < 8) {
            App.showWarning("The minimum length for a password is " + 8 + " characters");
            return false;
        }
        if (newPass.val() !== conPass.val()) {
            App.showWarning("Passwords do not match");
            return false;
        }
        App.showLoading();
        $.ajax({
            type: "POST",
            url: "/mod/changepassword",
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
                App.showWarning(resp.msg);
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

//--------------------- GENERAL MODIFICATION REQUESTS-------------------------//
App.resetRequestButtons = function (modItem) {
    modItem.find("button").each(function () {
        var t = $(this);
        t.removeClass("fail success");
        if (t.hasClass("mi-save")) {
            t.find("span").text("Save");
        } else if (t.hasClass("mi-remove")) {
            t.find("span").text("Remove");
        }
    });
};

App.requestModifyItem = function (url, data, button) {   
    var isSaveRequestType = data.requestType === "save";
    var requestPerformingMsg = isSaveRequestType ? "Saving" : "Removing";
    var requestSuccessMsg = isSaveRequestType ? "Saved" : "Removed";
    var requestFailMsg = isSaveRequestType ? "Save failed" : "Remove failed";
    if (data.requestType === "import") {
        requestPerformingMsg = "Importing";
        requestSuccessMsg = "Imported";
        requestFailMsg = "Import failed";
    }
    var loader = button.find(".mi-loader");
    var span = button.find("span");    
    loader.addClass("loading");
    button.removeClass("fail success");
    span.html(requestPerformingMsg);
    $.ajax({
        type: "POST",
        url: url,
        dataType: "json",
        data: data
    }).done(function (resp) {
        if (resp.success) {
            loader.removeClass("loading");
            button.addClass("success");
            span.html(requestSuccessMsg);
            switch (url) {
                case "/mod/staff":
                    App.staff = resp.msg;
                    break;
                case "/mod/receipt" :
                    App.receipt = resp.msg;
                    break;
                case "/mod/pos" :
                    App.settings = resp.msg;
                    break;
                case "/mod/plu" :              
                    var updatedArticle = resp.msg;      
                    var articles = App.catalog.articles;
                    var articleIndex = articles.binaryIndexOf("ean", resp.msg.ean);
                    if (isSaveRequestType) {
                        if (articleIndex >= 0) {
                            updatedArticle.id = articles[articleIndex].id;
                            articles[articleIndex] = updatedArticle;
                        } else {
                            updatedArticle.id = App.nArticles;
                            App.nArticles++;
                            articles.push(updatedArticle);
                            articles.sort(App.sortByEAN);
                            var modItem = button.parents().eq(2);
                            modItem.find("input[placeholder='EAN']").prop("disabled", true);
                            modItem.find(".mi-header").removeClass("new-item");
                        }
                    } else {
                        if (articleIndex >= 0) {
                            articles.splice(articleIndex, 1);
                        }
                    }
                    break;
                case "/mod/pluimport" :
                    App.catalog = resp.msg;
                    App.catalog.articles.sort(App.sortByEAN);
                    break;
                case "/mod/salegroups" :
                    var currentSG = App.buttons.saleGroups;
                    if (data._id === "new sg") {
                        button.parents().eq(1).find("input[placeholder='_ID']").val(resp.msg._id);
                        currentSG.push(resp.msg);
                    } else {
                        for (var i = 0; i < currentSG.length; i++) {
                            if (currentSG[i]._id === resp.msg._id) {
                                if (isSaveRequestType) {
                                    currentSG[i] = resp.msg;
                                } else {
                                    currentSG.splice(i, 1);
                                }
                                break;
                            }
                        }
                    }                    
                    App.renderSaleGroupsButtons();
                    break;
                default:
            }
            if (data.requestType === "remove") {
                button.parents().eq(2).slideUp(App.getAnimationTime(), function () {
                    $(this).remove();
                });
            }
        } else {
            loader.removeClass("loading");
            button.addClass("fail");
            span.html(requestFailMsg + "<br>Reason: " + resp.msg);
        }
    }).fail(function (resp) {
        loader.removeClass("loading");
        button.addClass("fail");
        span.html(requestFailMsg + "<br>Status: " + resp.status + " " + resp.responseText);
        if (resp.status === 0) {
            App.closeCurtain();
            App.showWarning("Network error. Server may be down or your internet connection is lost");
        }
    });
};

App.generateModItemFormDOM = function (type, item) {
    var disabledFields = [];
    var hiddenFields = [];
    var info = "";
    var isNewItem = "";
    switch (type) {
        case "staff":
            disabledFields = ["number"];
            break;
        case "receipt":
            info = "Tip: Use '&lt;br&gt;' to add new lines";
            break;
        case "pos":
            break;
        case "plu":
            disabledFields = ["ean"];
            break;
        case "newplu":
            isNewItem = " new-item";
            break;
        case "salegroups":
            disabledFields = ["_id"];
            hiddenFields = ["_id"];
            break;
        default:
    }
    
    var validRoles = ["Admin", "Seller"];
    // disable role field and remove button of the first admin user
    var isFirstAdmin = item.number && (item.number.value === 0) && item.role && (item.role.value === "Admin");
    var isReceipt = type === "receipt";
    var isPOS = type === "pos";
    var isSG = type === "salegroups";
    var isHiddenBody = ["staff", "salegroups"].indexOf(type) >= 0;
    var header = item.name ? item.name.value : type.toUpperCase();
    header = item.ean ? item.ean.value : header;
    if (isSG) {
        header = item.group ? item.group.value : header;
    }

    var keys = Object.keys(item);
    var dom = '<form class="mod-item" action method="POST">\
                    <div class="mi-header' + isNewItem + '">' + header + '</div>\
                    <div class="mi-body' + (isHiddenBody ? ' hidden' : '') + '">\
                    <div class="mi-info">' + info + '</div>';
    for (var i = 0; i < keys.length; i++) {
        //if(["_id", "id"].indexOf(keys[i]) < 0) {
                var fieldDisabled = disabledFields.indexOf(keys[i]) >= 0;
                var fieldHidden = hiddenFields.indexOf(keys[i]) >= 0;
                var roleDisabled = isFirstAdmin && (keys[i] === "role");
                var maxLength = 0;
                switch (keys[i]) {
                    case "pin":
                        maxLength = 4;
                        break;
                    default:
                        maxLength = 0;
                }
                dom += '<div class="mi-row' + (fieldHidden ? ' hidden': '') + '">\
                            <div class="mi-row-label">' + keys[i].toUpperCase() + '</div>';
                if(keys[i] === "currency") { 
                // ATTENTION!!!
                dom +=     '<select id="currency">\
                                <option data=\'{"code":"CZK","symbol":"Kč"}\' selected>CZK - Czech Koruna</option>\
                            </select>';   
                                            
                } else if(keys[i] === "role") {
                dom += '<select id="roles">';
                for (var j = 0; j < validRoles.length; j++) {
                    dom += '<option' 
                            + (validRoles[j] === item[keys[i]].value ? ' selected' : '')
                            + (isFirstAdmin ? ' disabled' : '')
                            +'>' + validRoles[j] + '</option>';
                }
                dom += '</select>';
                
                } else if(keys[i] === "tax") {
                // ATTENTION!!!    
                dom +=     '<select id="tax_rates">';
                var taxRates = App.settings.tax_rates;
                for (var j = 0; j < taxRates.length; j++){
                    dom +=     '<option' + (taxRates[j] === item[keys[i]].value ? ' selected' : '') + '>' + taxRates[j] + '</option>';    
                }
                dom +=     '</select>';
                
                } else if (keys[i] === "bg") {
                     dom += '<div class="colpicker" \
                                placeholder="' + keys[i].toUpperCase() + '">' 
                                + item[keys[i]].value + '</div>';
                } else {
                var validator = item[keys[i]].valid.toString().replace(/[\/^$]/g, "");
                dom +=     '<input class="" \
                                   type="text" \
                                   pattern="' + validator + '" \
                                   title="' + item[keys[i]].title + '" \
                                   placeholder="' + keys[i].toUpperCase() + '" \
                                   value="' + item[keys[i]].value + '"'
                                   + ((fieldDisabled || roleDisabled) ? ' disabled' : '')
                                   + (maxLength ? ' maxLength="' + maxLength + '"' : '') 
                                   + (fieldHidden ? '': ' required') + '>';   
                }
                dom += '</div>';
        //}
    }    
                dom += '<div class="mi-control">\
                            <button class="mi-save">\
                                <span>Save</span>\
                                <div class="mi-loader"></div>\
                            </button>\
                            <button class="mi-remove" ' + ((isFirstAdmin || isReceipt || isPOS || isNewItem) ? 'disabled' : '') + '>\
                                <span>Remove</span>\
                                <div class="mi-loader"></div>\
                            </button>\
                        </div>\
                    </div>\
                </form>';
    
    return dom;
};

// prepare submit to validate form before submit
App.prepareSubmit = function (dataFunction, button, requestType) {
    return {dataFunction: dataFunction, button: button, requestType: requestType};
};

App.bindModSettings = function (modFormContainer, modifyUrl) {  
    var submitted = null;
    modFormContainer.find("form.mod-item").submit(function (e) {
        e.preventDefault();
        var data = submitted.dataFunction(submitted.requestType, submitted.button);
        App.requestModifyItem(modifyUrl, data, submitted.button);
    });       
    var modifier = modFormContainer.find(".modifier");
    modifier.find(".mi-header").click(function () {
        var t = $(this);
        t.next(".mi-body").slideToggle(200);
    });    
    modifier.find("input").change(function () {
        App.resetRequestButtons($(this).parents().eq(1));
    });
    switch (modifyUrl) {
        case "/mod/staff" :
            modFormContainer.find(".adder").click(function () {
                var lastNumber = App.findMaxEmployeeNumber(modifier);
                var modItem = $(App.generateModItemFormDOM("staff", {
                    role: {title: "Admin or Seller", valid : /^(Admin|Seller)$/, value: "Seller"},
                    number: {title: "1-4 digits", valid : /^\d{1,4}$/, value: lastNumber + 1},
                    name: {title: "3 or more characters", valid : /^.{3,50}$/, value: "New employee"},
                    pin: {title: "4 digits", valid : /^\d{4}$/, value: "0000"}
                }));
                modItem.submit(function (e) {
                    e.preventDefault();
                    var data = submitted.dataFunction(submitted.requestType, submitted.button);
                    App.requestModifyItem(modifyUrl, data, submitted.button);
                });
                modItem.find("input").change(function () {
                    App.resetRequestButtons(modItem);
                });
                modItem.find(".mi-header").click(function () {
                    $(this).next(".mi-body").slideToggle(200);
                });
                modItem.find("button.mi-save").click(function () {
                    submitted = App.prepareSubmit(App.getMiEmployeeUpdateData, $(this), "save");
                }).click();
                modItem.find("button.mi-remove").click(function () {
                    submitted = App.prepareSubmit(App.getMiEmployeeUpdateData, $(this), "remove");
                });
                modItem.hide().appendTo(modifier).slideDown(App.getAnimationTime());
            });
            modifier.find("button.mi-save").click(function () {
                submitted = App.prepareSubmit(App.getMiEmployeeUpdateData, $(this), "save");
            });
            modifier.find("button.mi-remove").click(function () {
                submitted = App.prepareSubmit(App.getMiEmployeeUpdateData, $(this),"remove");
            });
            break;
        case "/mod/receipt" :            
            modifier.find("button.mi-save").click(function () {               
                submitted = App.prepareSubmit(App.getMiReceiptUpdateData, $(this), "save");
            });
            break;
        case "/mod/pos" :
            modifier.find("button.mi-save").click(function () {
                submitted = App.prepareSubmit(App.getMiPosUpdateData, $(this), "save");
            });
            break;
        case "/mod/salegroups" :            
            modFormContainer.find(".adder").click(function () {
                var modItem = $(App.generateModItemFormDOM("salegroups", {
                    tax: {title: "1-50 characters", valid: /^(0|10|15|21)$/, value: 15},
                    group: {title: "1-50 characters", valid: /^.{1,50}$/, value: "New Group"},
                    bg: {title: "Background color. Example: FFFFFF", valid: /^[A-Fa-f0-9]{6}$/, value: "BB5151"},
                    _id: {title: "24 \\w", valid: /^\w{24}$/, value: "new sg"}
                }));
                modItem.submit(function (e) {
                    e.preventDefault();
                    var data = submitted.dataFunction(submitted.requestType, submitted.button);
                    App.requestModifyItem(modifyUrl, data, submitted.button);
                });
                modItem.find("input").change(function () {
                    App.resetRequestButtons(modItem);
                });
                modItem.find(".mi-header").click(function () {
                    $(this).next(".mi-body").slideToggle(200);
                });
                modItem.find("button.mi-save").click(function () {
                    submitted = App.prepareSubmit(App.getMiSaleGroupUpdateData, $(this), "save");
                }).click();
                modItem.find("button.mi-remove").click(function () {
                    submitted = App.prepareSubmit(App.getMiSaleGroupUpdateData, $(this), "remove");
                });
                modItem.find("div[placeholder='BG']").each(function () {
                    var t = $(this);
                    App.bindColpick(t);
                });
                modItem.hide().appendTo(modifier).slideDown(App.getAnimationTime());
            });
            modifier.find("button.mi-save").click(function () {
                submitted = App.prepareSubmit(App.getMiSaleGroupUpdateData, $(this), "save");
            });
            modifier.find("button.mi-remove").click(function () {
                submitted = App.prepareSubmit(App.getMiSaleGroupUpdateData, $(this), "remove");
            });
            break;
        default:
    }
};

//--------------------------- STAFF SETTINGS ---------------------------------//
App.renderStaffSettings = function () {
    var staffDOM =
               '<div class="form-header">Staff Settings</div>\
                <div class="mod-form">\
                    <div class="form-row">\
                        <div class="form-label">MANAGE YOUR TEAM</div>\
                        <div class="adder"></div>\
                    </div>\
                    <div class="modifier">';
    var staff = App.staff;
    for (var i = 0; i < staff.length; i++) {
        var employee = staff[i];
        staffDOM += App.generateModItemFormDOM("staff", {
            role: {title: "Admin of Seller", valid : /^(Admin|Seller)$/, value: employee.role},
            number: {title: "1-4 digits", valid : /^\d{1,4}$/, value: employee.number},
            name: {title: "3 or more characters", valid : /^.{3,50}$/, value: employee.name},
            pin: {title: "4 digits", valid : /^\d{4}$/, value: employee.pin}
        });
    }
    staffDOM +=    '</div>\
                </div>';
    App.cpBody.html(App.createCenterBox(true, staffDOM));
    App.cpBody.find(".center-box").prepend(App.createGoBack());

    var modFormContainer = App.cpBody.find(".mod-form");     
    var modifyUrl = "/mod/staff";
        
    App.bindModSettings(modFormContainer, modifyUrl);
};

App.getMiEmployeeUpdateData = function (requestType, button) {
    var miBody = button.parents().eq(1);
    return {
        requestType: requestType,
        role: miBody.find("select").find(":selected").val(),
        number: miBody.find("input[placeholder='NUMBER']").val(),
        name: miBody.find("input[placeholder='NAME']").val(),
        pin: miBody.find("input[placeholder='PIN']").val()
    };
};

App.findMaxEmployeeNumber = function (modifier) {
    var lastMax = 0;
    modifier.find("input[placeholder='NUMBER']").each(function(){
        var thisNumber = parseInt($(this).val());
        if (lastMax < thisNumber){
            lastMax = thisNumber;
        }
    });
    return lastMax;
};

//------------------------- RECEIPT SETTINGS ---------------------------------//
App.renderReceiptSettings = function () {
    var receiptDOM =
            App.createCenterBox(true,
                   '<div class="form-header">Receipt Settings</div>\
                    <div class="mod-form" action="" method="POST">\
                        <div class="form-row">\
                            <div class="form-label">EDIT YOU RECEIPT</div>\
                        </div>\
                        <div class="modifier">'
                      + App.generateModItemFormDOM("receipt", {
                        header: {title: "Max 256 characters", valid : /^.{0,256}$/, value: App.receipt.header},
                        footer: {title: "Max 256 characters", valid : /^.{0,256}$/, value: App.receipt.footer}
                      })  
                      + '</div>\
                    </div>');
    App.cpBody.html(receiptDOM);    
    App.cpBody.find(".center-box").prepend(App.createGoBack());
    
    var modFormContainer = App.cpBody.find(".mod-form");
    var modifyUrl = "/mod/receipt";
    
    App.bindModSettings(modFormContainer, modifyUrl);
};

App.getMiReceiptUpdateData = function (requestType, button) {
    var miBody = button.parents().eq(1);
    return {
        requestType: requestType,
        header: miBody.find("input[placeholder='HEADER']").val(),
        footer: miBody.find("input[placeholder='FOOTER']").val()
    };
};

//--------------------------- POS SETTINGS -----------------------------------//
App.renderPOSSettings = function () {
    var receiptDOM =
            App.createCenterBox(true,
                    '<div class="form-header">Point of Sale Settings</div>\
                    <div class="mod-form" action="" method="POST">\
                        <div class="form-row">\
                            <div class="form-label">Configure your Cash Register</div>\
                        </div>\
                        <div class="modifier">'
                    + App.generateModItemFormDOM("pos", {
                        name:       {title: "3-100 characters", valid : /^.{3,100}$/,           value: App.settings.name},
                        tin:        {title: "8 digits", valid : /^\d{8}$/,              value: App.settings.tin},
                        vat:        {title: "Example: CZ1234567890", valid : /^[A-Z]{2}\d{8,10}$/,   value: App.settings.vat},
                        street:     {title: "5-100 characters", valid : /^.{5,100}$/,           value: App.settings.address.street},
                        city:       {title: "2-75 characters", valid : /^.{2,75}$/,            value: App.settings.address.city},
                        zip:        {title: "3-10 letters", valid : /^\w{3,10}$/,           value: App.settings.address.zip},
                        country:    {title: "3-75 characters", valid : /^.{3,75}$/,            value: App.settings.address.country},
                        phone:      {title: "9 digits with optional prefix", valid : /^\+?(\d{3})?\d{9}$/,   value: App.settings.phone},
                        /*ATTENTION!!! HANDLING this in calling function with if else*/
                        currency:   {title: "", valid : /^\{"code":"(CZK)","symbol":"(Kč)"\}$/, value: App.settings.currency}
                    })
                    + '</div>\
                    </div>');
    App.cpBody.html(receiptDOM);
    App.cpBody.find(".center-box").prepend(App.createGoBack());
    
    var modFormContainer = App.cpBody.find(".mod-form");
    var modifyUrl = "/mod/pos";
    
    App.bindModSettings(modFormContainer, modifyUrl);
};

App.getMiPosUpdateData = function (requestType, button) {
    var miBody = button.parents().eq(1);
    return {
        requestType: requestType,
        name    : miBody.find("input[placeholder='NAME']").val(),
        tin     : miBody.find("input[placeholder='TIN']").val(),
        vat     : miBody.find("input[placeholder='VAT']").val(),
        street  : miBody.find("input[placeholder='STREET']").val(),
        city    : miBody.find("input[placeholder='CITY']").val(),
        zip     : miBody.find("input[placeholder='ZIP']").val(),
        country : miBody.find("input[placeholder='COUNTRY']").val(),
        phone   : miBody.find("input[placeholder='PHONE']").val(),
        currency: miBody.find("select").find(":selected").attr("data")
    };
};

//--------------------------- PLU SETTINGS -----------------------------------//
App.checkAndTrimPluImportCSV = function (csv, lineSeparator, valueDelimiter) {    
    var lines = csv.split(lineSeparator);
    var validHeaders = ["ean", "name", "price", "group", "tax"];
    var headers = lines[0].split(valueDelimiter);
    if (headers.length !== validHeaders.length) {
        return {isValid: false, msg: "Invalid CSV header format. Incorrect number of fields. Must be " + validHeaders.length};
    }
    for (var i = 0; i < headers.length; i++) {
        headers[i] = headers[i].trim();
        if (headers[i] !== validHeaders[i]) {
            return {isValid: false, msg: "Invalid CSV header " + (i + 1) + ": " + headers[i] + ". Must be " + validHeaders[i]};
        }
    }
    var result = validHeaders.join(";");
    var validLine = [/^\d{1,13}$/, /^.{1,128}$/, /^\d{1,5}\.\d{2}$/, /^.{0,128}$/, /^(0|10|15|21)$/];
    var eanSet = [];               
    //var result = [];

    for (var i = 1; i < lines.length; i++) {
        var currentLine = lines[i].split(valueDelimiter);
        if (validLine.length !== currentLine.length) {            
            return {isValid: false, msg: "Invalid format on line " + (i + 1) + ". Must have " + validLine.length + " values separated by semicolons (;)"};
        }
        //var obj = {};
        for (var j = 0; j < validLine.length; j++) {
            currentLine[j] = currentLine[j].trim();
            if (!validLine[j].test(currentLine[j])) {
                return {isValid: false, msg: "Invalid CSV on line " + (i + 1) + ", column: " + headers[j] + ", value: " + (currentLine[j] || "/empty/")};
            }
            if (headers[j] === "ean") {
                eanSet.push({lineNumber: i + 1, ean: currentLine[j]});
            }
            //obj[headers[j]] = currentline[j];
        }
        result += "\n" + currentLine.join(";");
        //result.push(obj);
    }
    eanSet.sort(App.sortByEAN);
    var eanSetMaxLength = eanSet.length - 1;
    for (var i = 0; i < eanSetMaxLength; i++) {
        var currentItem = eanSet[i];
        var nextItem = eanSet[i + 1];
        if (currentItem.ean === nextItem.ean) {
            return {isValid: false, msg: "There are duplicate EAN codes in your csv on lines " + nextItem.lineNumber + " and " + currentItem.lineNumber};
        }
    }
    return {isValid: true, msg: result};
};

App.downloadTextFile = function (filename, text) {
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};

App.renderPLUSettings = function () {
    var pluDOM =
               '<div class="form-header">PLU Settings</div>\
                <div class="mod-form" action="" method="POST">\
                    <div class="form-row">\
                        <div class="form-label">MANAGE YOUR CATALOG</div>\
                    </div>\
                    <div class="form-row control">\
                        <button id="plu-import"><span>Import CSV</span><div class="mi-loader"></div></button>\
                        <input type="file" id="plu-import-input" accept=".csv"/>\
                        <button id="plu-export">Export CSV</button>\
                    </div>\
                    <div class="mi-info">Warning: Import will overwrite the current catalog!</div>\
                    <div class="hline"></div>\
                    <div class="mi-info">Tip: New PLU will be highlighted green if the EAN code is not found</div>\
                    <form class="form-row control">\
                        <input class="plu-searcher" placeholder="SEARCH EAN CODE" pattern="\\d{1,13}" title="EAN must have 1-13 digits">\
                        <button class="plu-search">Search / Add</button>\
                    </form>\
                    <div class="modifier"></div>\
                </form>';
    App.cpBody.html(App.createCenterBox(true, pluDOM));
    App.cpBody.find(".center-box").prepend(App.createGoBack());

    var modFormContainer = App.cpBody.find(".mod-form");     
    var modifyUrl = "/mod/plu";
    
    var modifier = modFormContainer.find(".modifier");
    var submitted = null;
    modFormContainer.submit(function(e){
        e.preventDefault();       
    });
    
    var pluInput = modFormContainer.find(".plu-searcher");
    modFormContainer.find(".plu-search").click(function () {
        var searchEAN = pluInput.val();
        pluInput.val("");
        if (searchEAN) {
            var i = App.catalog.articles.binaryIndexOf("ean", searchEAN);
            modifier.empty();
            if (i >= 0) {
                var item = App.catalog.articles[i];
                var modItem = $(App.generateModItemFormDOM("plu", {
                    ean: {title: "1-13 digits", valid : /^\d{1,13}$/, value: item.ean},
                    name: {title: "1-128 characters", valid : /^.{1,128}$/, value: item.name},
                    price: {title: "Example: 42.00", valid : /^\d{1,5}\.\d{2}$/, value: item.price},
                    group: {title: "Max 128 characters", valid : /^.{0,128}$/, value: item.group},
                    // ATTENTION!!! Handling this in calling function...
                    tax: {title: "", valid : /^(0|10|15|21)$/, value: item.tax}
                }));                
                modItem.submit(function (e) {
                    e.preventDefault();
                    var data = submitted.dataFunction(submitted.requestType, submitted.button);
                    App.requestModifyItem(modifyUrl, data, submitted.button);
                });
                modItem.find("input").change(function () {
                    App.resetRequestButtons(modItem);
                });
                modItem.find(".mi-header").click(function () {
                    $(this).next(".mi-body").slideToggle(200);
                });
                modItem.find("button.mi-save").click(function () {                    
                    submitted = App.prepareSubmit(App.getMiPluUpdateData,  $(this), "save");
                });
                modItem.find("button.mi-remove").click(function () {
                    submitted = App.prepareSubmit(App.getMiPluUpdateData, $(this), "remove");
                });
                modItem.hide().appendTo(modifier).slideDown(App.getAnimationTime());
            } else {
                var modItem = $(App.generateModItemFormDOM("newplu", {
                    ean: {title: "1-13 digits", valid : /^\d{1,13}$/, value: searchEAN},
                    name: {title: "1-128 characters", valid : /^.{1,128}$/, value: ""},
                    price: {title: "Example: 42.00", valid : /^\d{1,5}\.\d{2}$/, value: ""},
                    group: {title: "Max 128 characters", valid : /^.{0,128}$/, value: ""},
                    // ATTENTION!!! Handling this in calling function...
                    tax: {title: "", valid : /^(0|10|15|21)$/, value: App.settings.tax_rates[0]}
                }));
                modItem.submit(function (e) {
                    e.preventDefault();
                    var data = submitted.dataFunction(submitted.requestType, submitted.button);
                    App.requestModifyItem(modifyUrl, data, submitted.button);
                });
                modItem.find("input").change(function () {
                    App.resetRequestButtons(modItem);
                });
                modItem.find(".mi-header").click(function () {
                    $(this).next(".mi-body").slideToggle(200);
                });
                modItem.find("button.mi-save").click(function () {                    
                    submitted = App.prepareSubmit(App.getMiPluUpdateData, $(this), "save");
                });
                modItem.find("button.mi-remove").click(function () {                    
                    submitted = App.prepareSubmit(App.getMiPluUpdateData, $(this), "remove");
                });
                modItem.hide().appendTo(modifier).slideDown(App.getAnimationTime());
            }
        }
    });

    var pluImportButton = modFormContainer.find("#plu-import").click(function () {
        pluImportInput.wrap("<form>").closest("form").get(0).reset();
        pluImportInput.unwrap();
        pluImportInput.click();
    });
    var pluImportInput = modFormContainer.find("#plu-import-input");
    pluImportInput.change(function (e) {
        var files = e.target.files;
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function () {
            var csv = App.checkAndTrimPluImportCSV(this.result, /[\n\r]+/, ";");
            if (!csv.isValid) {
                App.closeCurtain();
                App.showWarning(csv.msg);
            } else {
                App.requestModifyItem("/mod/pluimport", {data: csv.msg, requestType: "import"}, pluImportButton);
            }
        };
        reader.readAsText(file);
    });
    modFormContainer.find("#plu-export").click(function () {
        var articles = App.catalog.articles;
        var articlesLength = articles.length;
        var result = "ean;name;price;group;tax";
        for (var i = 0; i < articlesLength; i++) {
            var article = articles[i];
            result += "\n" + article.ean + ";" + article.name + ";" + article.price + ";" + article.group + ";" + article.tax;
        }
        App.downloadTextFile("catalog.csv", result);
    });
};

App.getMiPluUpdateData = function (requestType, button) {
    var miBody = button.parents().eq(1);
    return {
        requestType: requestType,
        ean     : miBody.find("input[placeholder='EAN']").val(),
        name    : miBody.find("input[placeholder='NAME']").val(),
        price   : miBody.find("input[placeholder='PRICE']").val(),
        group   : miBody.find("input[placeholder='GROUP']").val(),
        tax     : miBody.find("select").find(":selected").val()
    };
};

//------------------------ SALE GROUPS SETTINGS ------------------------------//
App.renderSaleGroupsSettings = function () {
    var sgDOM =
            '<div class="form-header">Sale Groups Settings</div>\
                <div class="mod-form">\
                    <div class="form-row">\
                        <div class="form-label">MANAGE YOUR SALE GROUP BUTTONS</div>\
                        <div class="adder"></div>\
                    </div>\
                    <div class="modifier">';
    var saleGroups = App.buttons.saleGroups;
    for (var i = 0; i < saleGroups.length; i++) {
        var saleGroup = saleGroups[i];
        sgDOM += App.generateModItemFormDOM("salegroups", {
            tax: {title: "1-50 characters", valid: /^(0|10|15|21)$/, value: saleGroup.tax},
            group: {title: "1-50 characters", valid: /^.{1,50}$/, value: saleGroup.group},
            bg: {title: "Background color. Example: FFFFFF", valid: /^[A-Fa-f0-9]{6}$/, value: saleGroup.bg},
            _id: {title: "24 \\w", valid: /^(\w{24}|new sg)$/, value: saleGroup._id}
        });
    }
    sgDOM += '</div>\
                </div>';
    App.cpBody.html(App.createCenterBox(true, sgDOM));
    App.cpBody.find(".center-box").prepend(App.createGoBack(function () {
        $(".colpick.colpick_full").remove();
    }));

    var modFormContainer = App.cpBody.find(".mod-form");
    var modifyUrl = "/mod/salegroups";
    modFormContainer.find("div[placeholder='BG']").each(function () {
        var t = $(this);
        App.bindColpick(t);
    });
    App.bindModSettings(modFormContainer, modifyUrl);
};

App.getMiSaleGroupUpdateData = function (requestType, button) {
    var miBody = button.parents().eq(1);
    return {
        requestType: requestType,
        tax     : miBody.find("select").find(":selected").val(),
        group   : miBody.find("input[placeholder='GROUP']").val(),
        bg      : miBody.find("div[placeholder='BG']").text(),
        _id     : miBody.find("input[placeholder='_ID']").val()
    };
};

App.bindColpick = function (t) {
    t.colpick({
        color: t.text(),
        onSubmit: function (hsb, hex, rgb, el, bySetColor) {
            t.text(hex.toUpperCase());
            $(el).colpickHide();
        },
        onChange: function (hsb, hex, rgb, el, bySetColor) {
            t.text(hex.toUpperCase());
        }
    });
};

//------------------------ RENDER SALE HISTORY -------------------------------//
App.renderSaleHistory = function () {
    var shDOM =
            App.createCenterBox(false, 
                '<div class="form-header">Sale history</div>\
                <div id="sale-history-container">\
                </div>');
    App.cpBody.html(shDOM);
    
    App.cpBody.find(".center-box").prepend(App.createGoBack());
    
    var container = App.cpBody.find("#sale-history-container");
    var receipts = App.sales.receipts;
    var receiptsDOM = '<div class="history-receipt hr-header">\
                            <div class="hr-col">NUMBER</div>\
                            <div class="hr-col">DATE</div>\
                            <div class="hr-col">EMPLOYEE</div>\
                            <div class="hr-col">TOTAL PAID</div>\
                            <div class="hr-col">CONFIRMED</div>\
                            <div class="hr-col">RECEIPT</div>\
                       </div>';
    for (var i = receipts.length - 1; i >= 0; i--) {
        var receipt = receipts[i];
        var receiptTotal = 0;
        var items = receipt.items;
        for(var j = 0; j < items.length; j++) {
            receiptTotal += (parseFloat(items[j].price) * items[j].quantity);
        }
        receiptsDOM += 
                '<div class="history-receipt hr-row">\
                    <div class="hr-col hr-index">' + i + '</div>\
                    <div class="hr-col">' + receipt.number + '</div>\
                    <div class="hr-col">' + App.getDate(receipt.date) + '</div>\
                    <div class="hr-col">' + receipt.clerk + '</div>\
                    <div class="hr-col">' + receiptTotal.formatMoney() + ' ' + App.settings.currency.symbol + '</div>\
                    <div class="hr-col">' + (receipt.confirmed ? "YES" : "NO") + '</div>\
                    <div class="hr-col hr-print" title="Print this receipt"></div>\
                </div>';
    }

    container.append(receiptsDOM);
    container.find(".hr-print").click(function () {
        var t = $(this);
        var receiptIndex = parseInt(t.parent().find(".hr-index").text());

        App.jPrinterCopyReceipt = App.renderReceipt(receipts[receiptIndex]);

        App.showInCurtain(App.jPrinterCopyReceipt);

        window.print();
    });
};

App.renderReceipt = function (rec) {
    var items = rec.items;
    var receipt = $("<div>").addClass("receipt");
    /* var receiptHeader = $("<div>").addClass("receipt-header");
     $("<div>").addClass().text("Receipt Preview").appendTo(receipt);*/
    var receiptHeader = $(
            '<div class="receipt-header">\
                    <div class="preview">' + 'Receipt Preview' + '</div>\
                    <div class="company-name">' + App.settings.name + '</div>\
                    <div class="address-1">' + App.settings.address.street + '</div>\
                    <div class="address-2">' + App.settings.address.zip + ' ' + App.settings.address.city + '</div>\
                    <div class="receipt-row">\
                        <div class="tin">' + 'TIN: ' + App.settings.tin + '</div>\
                        <div class="vat">' + 'VAT: ' + App.settings.vat + '</div>\
                    </div>\
                </div>');
    $("<div>").addClass("receipt-custom-header").html(App.receipt.header + "<br>" + "<strong>RECEIPT COPY</strong>").appendTo(receiptHeader);
    $("<div>").attr("id", "receipt-number").text("Receipt #" + rec.number).appendTo(receiptHeader);
    receipt.append(receiptHeader);
    var receiptBody = $("<ul>").addClass("receipt-body");
    var taxValues = {};
    var nTrs = App.settings.tax_rates.length;
    for (var i = 0; i < nTrs; i++) {
        taxValues[App.settings.tax_rates[i]] = {tax: null, total: null};
    }
    var totalItems = 0;
    var totalAmount = 0;
    var tendered = parseFloat(rec.tendered);

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var q = item.quantity;
        totalItems += parseFloat(q);
        var p = item.price;
        var n = item.name;
        var taxRate = item.tax_rate;

        var thisTotal = parseFloat(p) * parseFloat(q);
        var receiptItem = $("<li>").addClass("receipt-item")
                .append($("<div>").addClass("ri-n").text(n))
                .append($("<div>").addClass("ri-v")
                        .append($("<div>").addClass("ri-q").text(q))
                        .append($("<div>").addClass("ri-x"))
                        .append($("<div>").addClass("ri-p").text(p))
                        .append($("<div>").addClass("ri-tt").text(thisTotal.formatMoney()))
                        );
        receiptBody.append(receiptItem);

        taxValues[taxRate].tax += (parseFloat(thisTotal) * parseFloat(taxRate) / 100);
        taxValues[taxRate].total += parseFloat(thisTotal);
        totalAmount += thisTotal;
    }
    //var total = App.jPayAmount.text().replace(/,/g, ".").replace(/[^\d\.\-]/g, "");
    receiptBody.appendTo(receipt);

    //creating receipt summary
    var receiptSummary = $("<div>").attr("id", "receipt-summary");
    $("<div>").attr("id", "rs-total-items")
            .append($("<div>").addClass("rs-label").text("Total items:"))
            .append($("<div>").addClass("rs-value").text(totalItems))
            .appendTo(receiptSummary);
    $("<div>").attr("id", "rs-total")
            .append($("<div>").addClass("rs-label").text("Total amount:"))
            .append($("<div>").addClass("rs-value").text(totalAmount.formatMoney()))
            .appendTo(receiptSummary);
    $("<div>").attr("id", "rs-tender")
            .append($("<div>").addClass("rs-label").text("Tendered:"))
            .append($("<div>").addClass("rs-value").text(tendered.formatMoney()))
            .appendTo(receiptSummary);
    $("<div>").attr("id", "rs-change")
            .append($("<div>").addClass("rs-label").text("Change:"))
            .append($("<div>").addClass("rs-value").text((tendered - totalAmount).formatMoney()))
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

    $("<div>").addClass("receipt-clerk").text("Checked: " + rec.clerk).appendTo(receipt);
    App.receiptTime = $("<div>").attr("id", "receipt-time").text(App.getDate(rec.date)).appendTo(receipt);

    $("<div>").addClass("receipt-gratitude").text(App.receipt.footer).appendTo(receipt);

    //creating receipt footer
    $("<div>").addClass("receipt-footer").text("EnterpriseApps").appendTo(receipt);

    var paymentBody = $("<div>").addClass("pb-body");
    var container = $("<div>").addClass("receipt-container");

    container.append(receipt);
    paymentBody.append(container);

    return $("<div id='payment-box'></div>").append(paymentBody);
};