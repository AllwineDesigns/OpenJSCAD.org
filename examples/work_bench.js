// title      : Work Table
// author     : John Allwine
// license    : MIT License
// description: a standing work table
// file       : work_bench.jscad

include('greedy_stock_problem.js');
include('packer.js');

function getParameterDefinitions() {
  return [
    { name: 'width', caption: 'Table Width', type: 'float', initial: 96 },
    { name: 'height', caption: 'Table Height', type: 'float', initial: 43 },
    { name: 'depth', caption: 'Table Depth', type: 'float', initial: 36 },
    { name: 'backboard', caption: 'Backboard', type: 'checkbox', checked: true },
    { name: 'backboard_shelf_height', caption: 'Shelf Height', type: 'float', initial: 74.75 },
    { name: 'backboard_shelf_depth', caption: 'Shelf Depth', type: 'float', initial: 11.875 },
    { name: 'overhang', caption: 'Overhang', type: 'float', initial: 0 }
  ];
}

function main(params) {
    var workBench = new WorkBench(params);

    var solid = workBench.getSolid();
    
    return solid;
}

var WorkBench = function(params) {
    this.table_height = params.height;
    this.table_width = params.width;
    this.table_depth = params.depth;

    this.overhang = params.overhang;

    this.backboard = params.backboard;
    this.backboard_shelf_height = params.backboard_shelf_height;
    this.backboard_shelf_depth = params.backboard_shelf_depth;

    this.backboard_shelf_gap = 2;
    this.backboard_gap = 3.5;

    this.plywood_thickness = .75;
    this.twobyfour_thickness = 1.5;
    this.twobyfour_width = 3.5;
    this.twobyfour_edge_radius = .125;
    this.pegboard_thickness = .25;
    
    if(this.backboard_shelf_depth > 0) {
        this.backboard_frame_height = params.backboard_shelf_height+this.twobyfour_thickness+this.backboard_shelf_gap;
        this.backboard_joist_length = this.backboard_frame_height-2*this.twobyfour_thickness-this.table_height;
        this.backboard_shelf_support_length = this.backboard_shelf_depth+this.twobyfour_width;
        this.backboard_pegboard_height = this.backboard_shelf_height-this.plywood_thickness-this.twobyfour_width-this.table_height-this.backboard_gap;
    } else {
        this.backboard_frame_height = params.backboard_shelf_height;
        this.backboard_joist_length = this.backboard_frame_height-2*this.twobyfour_thickness-this.table_height;
        this.backboard_shelf_support_length = 0;
        this.backboard_pegboard_height = this.backboard_frame_height-this.table_height-this.backboard_gap-this.backboard_shelf_gap-this.twobyfour_thickness;
    }

    this.leg_length = this.table_height-this.plywood_thickness;
    this.cross_support_length = Math.round(8*(sqrt(2)*.5*(this.table_depth-this.overhang-4*this.twobyfour_thickness)+this.twobyfour_width))/8;
    this.support_height = this.table_height-this.plywood_thickness-this.cross_support_length*Math.sqrt(2)*.5;

    this.support_length = this.table_depth-this.overhang-4*this.twobyfour_thickness;
    this.oversize = .1;

    this.yjoist_length = this.table_depth-this.overhang-2*this.twobyfour_thickness;

    this.numYJoists = Math.ceil((this.table_width-this.twobyfour_thickness)/24)+1;
    this.spaceBetween = (this.table_width-this.twobyfour_thickness)/(this.numYJoists-1);

    this.checkErrors();

    var message = {
        dimensions: [
            { dimension: Math.round(this.spaceBetween*8)/8, id: 'joist_spacing', label: 'I', description: 'Space between each joist on the table top and backboard (boards B and H).' },
            { dimension: Math.round((this.support_height)*8)/8, id: 'support_height', label: 'II', description: 'Height from the ground to the top of the horizontal leg support (board E).' }
        ]
    };

    var materials = [ { cut_length: this.yjoist_length, count: this.numYJoists, id: 'table_top_joists' },
                      { cut_length: this.leg_length, count: 8, id: 'legs' },
                      { cut_length: this.support_length, count: 2, id: 'side_supports' },
                      { cut_length: this.cross_support_length, count: 4, id: 'cross_supports'},
                      { cut_length: this.table_width, count: 2, id: 'table_width'}
    ];

    if(this.backboard) {
        materials.push({ cut_length: this.table_width, count: 2, id: 'backboard_width' });
        materials.push({ cut_length: this.backboard_joist_length, count: this.numYJoists, id: 'backboard_joists' });

        if(this.backboard_shelf_support_length > 0) {
            materials.push({ cut_length: this.backboard_shelf_support_length, count: this.numYJoists, id: 'shelf_supports' });
        }
    }

    var order = new CuttingStockOrder(materials, 96, .125, "MAX_LENGTH");
    var order2 = new CuttingStockOrder(materials, 96, .125, "MIN_WASTE"); 
    console.log(order2);

    if(order2.cutlist.length < order.cutlist.length) {
        order = order2;
    }

    var cutlist = order.cutlist;
    var labels = {
        backboard_width: 'G',
        table_width: 'A',
        legs: 'D',
        table_top_joists: 'B',
        cross_supports: 'F',
        side_supports: 'E',
        backboard_joists: 'H',
        shelf_supports: 'I'
    };
    for(var i = 0; i < cutlist.length; i++) {
        for(var j = 0; j < cutlist[i].length; j++) {
            cutlist[i][j].label = labels[cutlist[i][j].id];
        }
    }

    message.materials = {
        '2x4': cutlist,
        'plywood': [],
        'peg_board': [],
        'screws2.5': 2*this.numYJoists+2*4+16,
        'screws3': 4*this.numYJoists+3*4+2*8,
        'screws4': 0
    };

    if(this.backboard) {
        message.materials['screws2.5'] += 3*this.numYJoists;

        if(this.backboard_shelf_depth > 0) {
            message.materials['screws2.5'] += 2*this.numYJoists+3*this.numYJoists;
        }
        message.materials['screws3'] += 4*this.numYJoists;
        message.materials['screws4'] += 1+4*(this.numYJoists-1);
    }

    if(this.backboard && this.backboard_pegboard_height > 0) {
        message.materials.peg_board.push([{ w: this.table_width, h: this.backboard_pegboard_height, x: 0, y: 0, id: 'pegboard', label: 'K' }]);
    }

    var kerf = .125;

    var blocks = [
        { w: this.table_width+kerf, h: this.table_depth+kerf, id: 'table_top', label: 'C' }
    ];

    if(this.backboard && this.backboard_shelf_depth > 0) {
        blocks.push({ w: this.table_width+kerf, h: this.backboard_shelf_depth+kerf, id: 'shelf', label: 'J' });
    }

    var attempts = 0;
    var total_attempts = blocks.length;
    while(blocks.length > 0 && attempts < total_attempts) {
        var packer = new Packer(96+kerf, 48+kerf);
        var sheet = [];
        packer.fit(blocks);

        var did_not_fit = [];

        for(var n = 0; n < blocks.length; n++) {
            var block = blocks[n];
            if(block.fit) {
                sheet.push({ w: block.w-kerf, h: block.h-kerf, x: block.fit.x, y: block.fit.y, id: block.id, label: block.label });
            } else {
                did_not_fit.push(block);
            }
        }

        blocks = did_not_fit;
        message.materials.plywood.push(sheet);
        attempts++;
    }

    if(blocks.length > 0) {
        console.log("too many attempts");
        console.log(blocks);
    }

    console.log(message);
    postMessage({ cmd: 'windowMessage', message: message });
};

WorkBench.prototype.checkErrors = function() {
    if(this.table_height > 96.75) {
        throw new Error("Table height maximum is 96.75.");
    }

    var minHeight = this.twobyfour_thickness+this.plywood_thickness+.5*(this.table_depth-4*this.twobyfour_thickness)+this.twobyfour_width*Math.sqrt(2)*.5;
    if(this.table_height < minHeight) {
        throw new Error("Table height minimum is " + (Math.ceil(100*minHeight)/100).toFixed(2));
    }

    if(this.table_width > 96) {
        throw new Error("Table width maximum is 96.");
    }
    if(this.table_width < 13) {
        throw new Error("Table width minimum is 13.");
    }
    if(this.table_depth > 48) {
        throw new Error("Table depth maximum is 48.");
    }
    if(this.table_depth-this.overhang < 12) {
        throw new Error("Table depth minus overhang minimum is 12.");
    }

    if(this.backboard) {
        if(this.backboard_shelf_height < this.table_height+this.plywood_thickness+this.twobyfour_width+this.backboard_gap) {
            throw new Error("Shelf height must be at least table height plus " + (this.plywood_thickness+this.twobyfour_width+this.backboard_gap));
        }

        if(this.backboard_pegboard_height > 48) {
            throw new Error("This configuration is not possible because the peg board height would exceed the maximum of 48\". Adjust your table height and/or shelf height.");
        }

        if(this.backboard_shelf_depth > 48-this.twobyfour_width) {
            throw new Error("The shelf depth maximum is " + (48-this.twobyfour_width));
        }
    }
}

WorkBench.prototype.getSolid = function() {
    var partLists = [ this.LeftBackLeg(), this.LeftFrontLeg(), this.RightBackLeg(), this.RightFrontLeg(), this.Supports(), this.TableTop() ];

    if(this.backboard) {
        partLists.push(this.Backboard());
    }

    var allParts = [];

    for(var i = 0; i < partLists.length; i++) {
        Array.prototype.push.apply(allParts, partLists[i]);
    }

    return allParts;
}

WorkBench.prototype.Backboard = function() {
    var parts = [
        this.HorizontalTwoByFour(this.table_width).rotateX(90).translate([0,this.table_depth, this.table_height]),
        this.HorizontalTwoByFour(this.table_width).rotateX(90).translate([0,this.table_depth, this.backboard_frame_height-this.twobyfour_thickness])
    ];

    if(this.backboard_shelf_depth > 0) {
        parts.push(cube([this.table_width, this.backboard_shelf_depth, this.plywood_thickness]).translate([0,this.table_depth-this.backboard_shelf_support_length,this.backboard_shelf_height-this.plywood_thickness]));
    }

    if(this.backboard_pegboard_height > 0) {
        parts.push(cube([this.table_width, this.pegboard_thickness, this.backboard_pegboard_height]).translate([0,this.table_depth-this.pegboard_thickness-this.twobyfour_width, this.table_height+this.backboard_gap]))
    }

    for(var i = 0; i < this.numYJoists; i++) {
        var x = i*(this.table_width-this.twobyfour_thickness)/(this.numYJoists-1);
        parts.push(this.VerticalTwoByFour(this.backboard_joist_length).translate([x, this.table_depth-this.twobyfour_width, this.table_height+this.twobyfour_thickness]));

        if(this.backboard_shelf_support_length > 0) {
            if(i == this.numYJoists-1) {
                parts.push(this.FourtyFiveTwoByFour(this.backboard_shelf_support_length,1,false, false).rotateX(-90).translate([x-this.twobyfour_thickness,this.table_depth-this.backboard_shelf_support_length,this.backboard_shelf_height-this.plywood_thickness]));
            } else {
                parts.push(this.FourtyFiveTwoByFour(this.backboard_shelf_support_length,1,false, false).rotateX(-90).translate([x+this.twobyfour_thickness,this.table_depth-this.backboard_shelf_support_length,this.backboard_shelf_height-this.plywood_thickness]));
            }
        }
    }

    return parts;
};

WorkBench.prototype.Supports = function() {
    return [ 
    this.HorizontalTwoByFour(this.support_length).rotateZ(90).rotateY(90).translate([2*this.twobyfour_thickness, 2*this.twobyfour_thickness+this.overhang, this.support_height-this.twobyfour_thickness]),
    this.HorizontalTwoByFour(this.support_length).rotateZ(90).rotateY(90).translate([this.table_width-this.twobyfour_width-2*this.twobyfour_thickness, 2*this.twobyfour_thickness+this.overhang, this.support_height-this.twobyfour_thickness]),
    this.FourtyFiveTwoByFour(this.cross_support_length).translate([2*this.twobyfour_thickness,this.table_depth-2*this.twobyfour_thickness, this.table_height-this.plywood_thickness]),
    this.FourtyFiveTwoByFour(this.cross_support_length).rotateZ(180).translate([4*this.twobyfour_thickness,2*this.twobyfour_thickness+this.overhang, this.table_height-this.plywood_thickness]),
    this.FourtyFiveTwoByFour(this.cross_support_length).translate([this.table_width-3*this.twobyfour_thickness,this.table_depth-2*this.twobyfour_thickness, this.table_height-this.plywood_thickness]),
    this.FourtyFiveTwoByFour(this.cross_support_length).rotateZ(180).translate([this.table_width-3*this.twobyfour_thickness,2*this.twobyfour_thickness+this.overhang, this.table_height-this.plywood_thickness])
    ];
}


WorkBench.prototype.Leg = function() {
    return this.VerticalTwoByFour(this.leg_length);
}

WorkBench.prototype.LeftFrontLeg = function() {
    return [ this.Leg().translate([this.twobyfour_thickness, this.twobyfour_thickness+this.overhang,0]), this.Leg().rotateZ(-90).translate([2*this.twobyfour_thickness, 2*this.twobyfour_thickness+this.overhang, 0]) ];
}

WorkBench.prototype.LeftBackLeg = function() {
    return [ this.Leg().translate([this.twobyfour_thickness, this.table_depth-this.twobyfour_width-this.twobyfour_thickness, 0]), this.Leg().rotateZ(-90).translate([2*this.twobyfour_thickness, this.table_depth-this.twobyfour_thickness, 0]) ];
}

WorkBench.prototype.RightFrontLeg = function() {
    return [ this.Leg().translate([this.table_width-2*this.twobyfour_thickness, this.twobyfour_thickness+this.overhang, 0]), this.Leg().rotateZ(-90).translate([this.table_width-2*this.twobyfour_thickness-this.twobyfour_width, 2*this.twobyfour_thickness+this.overhang, 0])  ];
}

WorkBench.prototype.RightBackLeg = function() {
    return [ this.Leg().translate([this.table_width-2*this.twobyfour_thickness, this.table_depth-this.twobyfour_width-this.twobyfour_thickness, 0]), this.Leg().rotateZ(-90).translate([this.table_width-2*this.twobyfour_thickness-this.twobyfour_width, this.table_depth-this.twobyfour_thickness, 0]) ];
}

WorkBench.prototype.TableTop = function() {
    var parts =  [ 
    this.HorizontalTwoByFour(this.table_width).translate([0,this.overhang,this.leg_length-this.twobyfour_width]), 
    this.HorizontalTwoByFour(this.table_width).translate([0,this.table_depth-this.twobyfour_thickness,this.leg_length-this.twobyfour_width]),
    this.HorizontalTwoByFour(this.yjoist_length).rotateZ(90).translate([this.twobyfour_thickness, this.twobyfour_thickness+this.overhang, this.leg_length-this.twobyfour_width]),
    this.HorizontalTwoByFour(this.yjoist_length).rotateZ(90).translate([this.table_width, this.twobyfour_thickness+this.overhang, this.leg_length-this.twobyfour_width]),
    cube([this.table_width, this.table_depth, this.plywood_thickness]).translate([0,0,this.leg_length])
    ];

    for(var i = 1; i < this.numYJoists-1; i++) {
        var x = i*(this.table_width-this.twobyfour_thickness)/(this.numYJoists-1);
        parts.push(this.HorizontalTwoByFour(this.yjoist_length).rotateZ(90).translate([this.twobyfour_thickness+x, this.twobyfour_thickness+this.overhang, this.leg_length-this.twobyfour_width]));
    }

    return parts;
}

WorkBench.prototype.VerticalTwoByFour = function(length) {
    var corners = [
        circle({ r: this.twobyfour_edge_radius }),
        circle({ r: this.twobyfour_edge_radius }).translate([this.twobyfour_thickness-2*this.twobyfour_edge_radius, 0,0]),
        circle({ r: this.twobyfour_edge_radius }).translate([this.twobyfour_thickness-2*this.twobyfour_edge_radius, this.twobyfour_width-2*this.twobyfour_edge_radius,0]),
        circle({ r: this.twobyfour_edge_radius }).translate([0, this.twobyfour_width-2*this.twobyfour_edge_radius,0]),
    ];

    return linear_extrude({height: length}, hull(corners));
}

WorkBench.prototype.HorizontalTwoByFour = function(length) {
    return this.VerticalTwoByFour(length).rotateY(90).rotateX(90);
}

WorkBench.prototype.FourtyFiveTwoByFour = function(length,cut_ends=2, doTranslate=true, doRotate=true) {
    var len_sqrt2 = length/sqrt(2);
    var part = this.VerticalTwoByFour(length).rotateX(-45);
    
    if(cut_ends >= 1) {
        part = part.subtract(cube(2*this.twobyfour_width).translate([0,0,-2*this.twobyfour_width]));
    }
    if(cut_ends == 2) {
        part = part.subtract(cube(2*this.twobyfour_width).translate([0,len_sqrt2, len_sqrt2-2*this.twobyfour_width]));
    }

    if(doTranslate) {
        part = part.translate([0,-len_sqrt2,-len_sqrt2]);
    }

    if(!doRotate) {
        part = part.rotateX(45);
    }

    return part;
}
