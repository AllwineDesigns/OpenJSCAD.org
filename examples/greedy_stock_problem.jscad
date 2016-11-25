// Uses a greedy solution to solve for the number of full lengths of some kind of stock material (i.e. 8 foot 2x4s)
// such that you can cut all of the provided shorter lengths of that stock (i.e. you're building a table and you 
// have the lengths for each leg/joist/etc. and need to know how many 2x4s to buy and how to cut them). The algorithm
// attempts to minimize the number of 2x4s required, but is not guaranteed to return the optimal solution.

// This is a utility library that can be included in other jscad files so that you can calculate material lists.

var CuttingStockPattern = function(stockLength) {
    this.waste = stockLength;
    this.cuts = {};
};

CuttingStockPattern.prototype.addCut = function(cut, kerf) {
    if(this.cuts[cut] === undefined) {
        this.cuts[cut] = 1;
    } else {
        this.cuts[cut]++;
    }
    this.waste -= cut;
    if(this.waste > 0) {
        this.waste -= kerf;
        if(this.waste < 0) {
            this.waste = 0;
        }
    }
};

CuttingStockPattern.prototype.getBasicObject = function() {
    var obj = {};
    obj.waste = this.waste;
    obj.cuts = {};
    for(var k in this.cuts) {
        obj.cuts[k] = this.cuts[k];
    }

    return obj;
};

// materials structure example:
// [
//    { cut_length: 23, count: 5, id: 'joists' },
//    { cut_length: 37, count: 4, id: 'legs' },
//    { cut_length: 96, count: 2, id: 'beams' }
// ]
// ids are assumed to be unique
var CuttingStockOrder = function(materials, stockLength, kerf) {
    var quantities = {};

    for(var i = 0; i < materials.length; i++) {
        var material = materials[i];
        
        if(quantities.hasOwnProperty(material.cut_length)) {
            quantities[material.cut_length] += material.count;
        } else {
            quantities[material.cut_length] = material.count;
        }
    }

    kerf = kerf === undefined ? .125 : kerf;

    this.stockLength = stockLength;
    this.neededQuantities = {};
    this.quantities = {};

    for(var k in quantities) {
        this.neededQuantities[k] = quantities[k];
        this.quantities[k] = 0;
    }

    this.patterns = [];
    this.waste = 0;
    this.complete = false;
    this.stockCount = 0;
    this.wastePct = 0;

    while(!this.complete) {
        var pattern = new CuttingStockPattern(this.stockLength);
        
        var cuts = this.getNeededCuts();
        var keys = Object.keys(cuts);
        for(var i = 0; i < keys.length; i++) {
            keys[i] = parseFloat(keys[i]);
        }
        keys.sort(function(a,b) {
            return b-a;
        });

        for(var i = 0; i < keys.length; i++) {
            var cutLength = keys[i];
            while(cutLength <= pattern.waste && cuts[cutLength] > 0) {
                pattern.addCut(cutLength, kerf);
                cuts[cutLength]--;
            }
        }

        var count = this.calculateCount(pattern);
        this.addPattern(pattern, count);
    }

    var length2id = {};

    for(var i = 0; i < materials.length; i++) {
        var material = materials[i];

        for(var j = 0; j < material.count; j++) {
            if(length2id.hasOwnProperty(material.cut_length)) {
                length2id[material.cut_length].push(material.id);
            } else {
                length2id[material.cut_length] = [ material.id ];
            }
        }
        
    }

    this.cutlist = [];

    for(var i = 0; i < this.patterns.length; i++) {
        var pattern = this.patterns[i];
        for(var j = 0; j < pattern.count; j++) {
            var cuts = [];
            for(var k in pattern.pattern.cuts) {
                var cut_length = parseFloat(k);
                for(var l = 0; l < pattern.pattern.cuts[k]; l++) {
                    var cut = {
                        cut_length: cut_length,
                        id: length2id[k].pop()
                    };

                    cuts.push(cut);
                }
            }

            this.cutlist.push(cuts);
        }
    }
};

CuttingStockOrder.prototype.addPattern = function(pattern, count) {
    this.patterns.push({ count: count, pattern: pattern });
    this.stockCount += count;
    this.waste += pattern.waste*count;
    this.wastePct = this.waste/(this.stockCount*this.stockLength)*100;

    for(var k in pattern.cuts) {
        this.quantities[k] += pattern.cuts[k]*count;
    }

    var complete = true;
    for(var k in this.neededQuantities) {
        if(this.quantities[k] < this.neededQuantities[k]) {
            complete = false;
        }
    }
    this.complete = complete;
};

CuttingStockOrder.prototype.clone = function() {
    var obj = new CuttingStockOrder(this.neededQuantities, this.stockLength);
    obj.stockCount = this.stockCount;
    obj.waste = this.waste;
    obj.wastePct = this.wastePct;
    obj.complete = this.complete;

    for(var k in this.quantities) {
        obj.neededQuantities[k] = this.neededQuantities[k];
        obj.quantities[k] = this.quantities[k];
    }

    obj.patterns = this.patterns.slice(0);
    return obj;
};

CuttingStockOrder.prototype.calculateCount = function(pattern) {
    var count =  -1;
    for(var cutLength in pattern.cuts) {
        var needed = this.neededQuantities[cutLength]-this.quantities[cutLength];
        var canMakeWithOnePattern = pattern.cuts[cutLength];
        var c = canMakeWithOnePattern > 0 ? Math.floor(needed/canMakeWithOnePattern) : 0;
        if(count == -1 || c < count) {
            count = c;
        }
    }

    return count;
}

CuttingStockOrder.prototype.getNeededCuts = function() {
    var needed = {
    };

    for(var k in this.quantities) {
        var n = this.neededQuantities[k]-this.quantities[k];
        if(n > 0) {
            needed[k] = n;
        }

    }

    return needed;
};
