// Uses a greedy solution to solve for the number of full lengths of some kind of stock material (i.e. 8 foot 2x4s)
// such that you can cut all of the provided shorter lengths of that stock (i.e. you're building a table and you 
// have the lengths for each leg/joist/etc. and need to know how many 2x4s to buy and how to cut them). The algorithm
// attempts to minimize the number of 2x4s required, but is not guaranteed to return the optimal solution.

// This is a utility library that can be included in other jscad files so that you can calculate material lists.

// stockLength - length of material from store
// cuts - array of floating point lengths that need to be cut from our stock
// kerf - width of the saw blade used to make the cuts
var CuttingStockPatterns = function(stockLength, cuts, kerf) {
    if(kerf === undefined) {
        kerf = .125;
    }

    this.seen = {};
    this.patterns = [];
    this.cuts = cuts.slice(0);

    var that = this;

    var addPattern = function(pattern) {
        var hash = pattern.getHashString();
        if(!that.seen[hash]) {
            that.seen[hash] = true;
            that.patterns.push(pattern);
        }
    };

    var findPatterns = function(pattern) {
        for(var i = 0; i < that.cuts.length; i++) {
            if(that.cuts[i] <= pattern.waste) {
                var p = pattern.clone();
                p.addCut(that.cuts[i], kerf);
                addPattern(p);
                findPatterns(p);
            }
        }
    };


    findPatterns(new CuttingStockPattern(stockLength));
};

CuttingStockPatterns.prototype.getPatterns = function() {
    var patterns = [];
    for(var i = 0; i < this.patterns.length; i++) {
        patterns.push(this.patterns[i]);
    }

    return patterns;
}

var CuttingStockPattern = function(stockLength) {
    this.waste = stockLength;
    this.cuts = {};
};

CuttingStockPattern.prototype.clone = function() {
    var obj = new CuttingStockPattern();
    obj.waste = this.waste;
    obj.cuts = {};
    for(var k in this.cuts) {
        obj.cuts[k] = this.cuts[k];
    }

    return obj;
}

CuttingStockPattern.prototype.getHashString = function() {
    var hash = "";
    var keys = Object.keys(this.cuts);
    keys.sort();
    for(var i = 0; i < keys.length; i++) {
        var k = keys[i];
        hash += k + "_";
        hash += this.cuts[k]+ ":";
    }

    return hash;
}

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
var CuttingStockOrder = function(materials, stockLength, kerf, fillMode) {
    if(fillMode === undefined) {
        fillMode = "MAX_LENGTH";
    }
    var quantities = {};

    this.lengths = [];

    for(var i = 0; i < materials.length; i++) {
        var material = materials[i];
        
        if(quantities.hasOwnProperty(material.cut_length)) {
            quantities[material.cut_length] += material.count;
        } else {
            this.lengths.push(material.cut_length);
            quantities[material.cut_length] = material.count;
        }
    }

    this.kerf = kerf === undefined ? .125 : kerf;
    kerf = this.kerf;

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

    if(fillMode == "MAX_LENGTH") {
        this.greedyFillByMaxLength();
    } else {
        this.greedyFillByMinWaste();
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

CuttingStockOrder.prototype.greedyFillByMinWaste = function() {
    var patterns = new CuttingStockPatterns(96, this.lengths);
    patterns.patterns.sort(function(a,b) {
        return a.waste - b.waste;
    });

    while(!this.complete) {
        this.addPattern(patterns.patterns[0], 1);
        for(var i = 0; i < patterns.patterns.length; i++) {
            if(this.calculateCount(patterns.patterns[i]) == 0) {
                patterns.patterns.splice(i, 1);
                i--;
            }
        }
    }
};

CuttingStockOrder.prototype.greedyFillByMaxLength = function() {
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
                pattern.addCut(cutLength, this.kerf);
                cuts[cutLength]--;
            }
        }

        var count = this.calculateCount(pattern);
        this.addPattern(pattern, count);
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
