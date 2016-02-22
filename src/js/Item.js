
App.Item = function (id, ean, name, price, group, tax, tags, desc) {
    this.id = id;
    this.ean = ean;
    this.name = name;
    this.price = price;
    this.group = group;
    this.tax = tax;
    this.tags = tags;
    this.desc = desc;
};

App.Item.prototype.valueOf = function () {
    return this.ean;
};