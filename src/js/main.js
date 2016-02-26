
/*
 * 
 * 
 */
$(document).ready(function () {
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
    $.getJSON("/api/buttons", function (data) {
        var sg = $("#sale-groups");
        for (var i = 0; i < data.saleGroups.length; i++) {
            $("<button>", {
                class: "sg",
                "sg-id": "sg" + i,
                "sg-tax": data.saleGroups[i].tax,
                "sg-group": data.saleGroups[i].group,
                text: data.saleGroups[i].text,
                css: {"background-color": "#" + data.saleGroups[i].bg}
            }).appendTo(sg);
        }
        App.bindSaleGroups(sg, jPriceInput, jSaleList, jRegistrySession);

        var qs = $("#quick-sales");
        for (var i = 0; i < data.quickSales.length; i++) {
            var t = data.quickSales[i];
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
            0:  {tax: null, total: null},
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
        console.log(taxValues);
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
                .append($("<div>").addClass("rs-value").text(Number(0).formatMoney(2, ".", "")))
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
                //console.log(taxes);
            }
        }
        receiptSummary.appendTo(receipt);

        //creating receipt footer
        $("<div>").addClass("receipt-footer").text("EnterpriseApps").appendTo(receipt);

        //creating payment section
        var payment = $("<div>").attr("id", "payment");
        $("<div>").addClass("cash-pay-label").text("Amount to pay").appendTo(payment);
        $("<div>").attr("id", "cash-pay-topay").text(total + " Kč").appendTo(payment);
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
                    var newChange = (parseFloat(t.val()) - parseFloat(total)).formatMoney(2, ".", "");
                    t.parents("#payment").find("#cash-change").text(newChange + " Kč");
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
                        $("#cash-change").text((cash - parseFloat(total)).formatMoney(2, ".", "") + " Kč");
                    })
                    .appendTo(quickCash);
        }
        quickCash.appendTo(payment);

        $("<div>").addClass("cash-pay-label").text("Change").appendTo(payment);
        $("<div>").attr("id", "cash-change").text(Number(0).formatMoney(2, ".", "") + " Kč").appendTo(payment);

        payment.appendTo(paymentBody);
        $("<div>").addClass("receipt-container").append(receipt).appendTo(paymentBody);

        paymentBody.appendTo(paymentBox);

        App.showInCurtain(paymentBox);
        cashInput.focus();
    });

    //populating articles for scanning
    var catalog = [];
    catalog.push(new App.Item(
            Math.floor((Math.random() * 10) + 1),
            "40152233",
            "Wax",
            "45.00",
            "description"
            ));
    catalog.push(new App.Item(
            Math.floor((Math.random() * 10) + 1),
            "4043619653553",
            "Audio Cable",
            "105.00",
            "description"
            ));
    catalog.sort(function (a, b) {
        return a.ean < b.ean ? -1 : 1;
    });
    var jSearchBox = $("#search");
    jSearchBox.keyup(function (e) {
        var t = $(this);
        if (e.keyCode === 13) {
            var filter = t.val();
            var i = catalog.binaryIndexOf(filter);
            if (i >= 0) {
                var item = catalog[i];
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
                warningBody.text("This EAN " + filter + " is not defined");
                warningBody.appendTo(warning);
                App.showInCurtain(warning);
            }
            t.val("");
        }
    }).click(function () {
        $(this).removeClass("not-found");
    }).focus(function () {
        $(this).removeClass("not-found");
    });

    $(document).scannerDetection(function (s) {
        $("#curtain").remove();
        jSearchBox.val(s);
        var e = $.Event('keyup');
        e.keyCode = 13;
        jSearchBox.trigger(e);
        jPriceInput.blur();
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
