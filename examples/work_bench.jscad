// title      : Work Table
// author     : John Allwine
// license    : MIT License
// description: a work table
// file       : work_table.jscad

include('greedy_stock_problem.jscad');
include('packer.js');

function getParameterDefinitions() {
  return [
    { name: 'width', caption: 'Table Width', type: 'float', initial: 96 },
    { name: 'height', caption: 'Table Height', type: 'float', initial: 43 },
    { name: 'depth', caption: 'Table Depth', type: 'float', initial: 36 },
    { name: 'backboard', caption: 'Backboard', type: 'checkbox', checked: true },
    { name: 'backboard_shelf_height', caption: 'Shelf Height', type: 'float', initial: 74.75 },
    { name: 'backboard_shelf_depth', caption: 'Shelf Depth', type: 'float', initial: 11.875 },
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
    
    this.backboard_frame_height = params.backboard_shelf_height+this.twobyfour_thickness+this.backboard_shelf_gap;
    this.backboard_joist_length = this.backboard_frame_height-2*this.twobyfour_thickness-this.table_height;
    this.backboard_shelf_support_length = this.backboard_shelf_depth+this.twobyfour_width;
    this.backboard_pegboard_height = this.backboard_shelf_height-this.plywood_thickness-this.twobyfour_width-this.table_height-this.backboard_gap;

    this.leg_length = this.table_height-this.plywood_thickness;
    this.cross_support_length = Math.round(8*(sqrt(2)*.5*(this.table_depth-4*this.twobyfour_thickness)+this.twobyfour_width))/8;
    this.support_height = this.table_height-this.plywood_thickness-this.cross_support_length*Math.sqrt(2)*.5;

    this.support_length = this.table_depth-4*this.twobyfour_thickness;
    this.oversize = .1;

    this.yjoist_length = this.table_depth-2*this.twobyfour_thickness;

    this.numYJoists = Math.ceil((this.table_width-this.twobyfour_thickness)/24)+1;
    this.spaceBetween = (this.table_width-this.twobyfour_thickness)/(this.numYJoists-1);

    this.checkErrors();

    var message = {};

    var materials = [ { cut_length: this.yjoist_length, count: this.numYJoists, id: 'table_top_joists' },
                      { cut_length: this.leg_length, count: 8, id: 'legs' },
                      { cut_length: this.support_length, count: 2, id: 'side_supports' },
                      { cut_length: this.cross_support_length, count: 4, id: 'cross_supports'},
                      { cut_length: this.table_width, count: 2, id: 'table_width'}
    ];

    if(this.backboard) {
        materials.push({ cut_length: this.table_width, count: 2, id: 'backboard_width' });
        materials.push({ cut_length: this.backboard_shelf_support_length, count: this.numYJoists, id: 'shelf_supports' });
        materials.push({ cut_length: this.backboard_joist_length, count: this.numYJoists, id: 'backboard_joists' });
    }

    var order = new CuttingStockOrder(materials, 96);

    message.materials = {
        '2x4': order.cutlist,
        'plywood': [],
        'peg_board': []
    };

    if(this.backboard) {
        message.materials.peg_board.push({ w: this.table_width, h: this.backboard_pegboard_height });
    }

    var kerf = .125;

    var blocks = [
        { w: this.table_width+kerf, h: this.table_depth+kerf }
    ];

    if(this.backboard) {
        blocks.push({ w: this.table_width+kerf, h: this.backboard_shelf_depth+kerf });
    }

    var packer = new Packer(96+kerf, 48+kerf);
    while(blocks.length > 0) {
        var sheet = [];
        packer.fit(blocks);

        var did_not_fit = [];

        for(var n = 0; n < blocks.length; n++) {
            var block = blocks[n];
            if(block.fit) {
                sheet.push({ w: block.w-kerf, h: block.h-kerf, x: block.fit.x, y: block.fit.y });
            } else {
                did_not_fit.push(block);
            }
        }

        blocks = did_not_fit;
        message.materials.plywood.push(sheet);
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
    if(this.table_width < 12) {
        throw new Error("Table width minimum is 12.");
    }
    if(this.table_depth > 48) {
        throw new Error("Table depth maximum is 48.");
    }
    if(this.table_depth < 12) {
        throw new Error("Table depth minimum is 12.");
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
        this.HorizontalTwoByFour(this.table_width).rotateX(90).translate([0,this.table_depth, this.backboard_frame_height-this.twobyfour_thickness]),
        cube([this.table_width, this.backboard_shelf_depth, this.plywood_thickness]).translate([0,this.table_depth-this.backboard_shelf_support_length,this.backboard_shelf_height-this.plywood_thickness]),
        cube([this.table_width, this.pegboard_thickness, this.backboard_pegboard_height]).translate([0,this.table_depth-this.pegboard_thickness-this.twobyfour_width, this.table_height+this.backboard_gap])
    ];

    for(var i = 0; i < this.numYJoists; i++) {
        var x = i*(this.table_width-this.twobyfour_thickness)/(this.numYJoists-1);
        parts.push(this.VerticalTwoByFour(this.backboard_joist_length).translate([x, this.table_depth-this.twobyfour_width, this.table_height+this.twobyfour_thickness]));
        if(i == this.numYJoists-1) {
            parts.push(this.FourtyFiveTwoByFour(this.backboard_shelf_support_length,1,false, false).rotateX(-90).translate([x-this.twobyfour_thickness,this.table_depth-this.backboard_shelf_support_length,this.backboard_shelf_height-this.plywood_thickness]));
        } else {
            parts.push(this.FourtyFiveTwoByFour(this.backboard_shelf_support_length,1,false, false).rotateX(-90).translate([x+this.twobyfour_thickness,this.table_depth-this.backboard_shelf_support_length,this.backboard_shelf_height-this.plywood_thickness]));
        }
    }

    return parts;
};

WorkBench.prototype.Supports = function() {
    return [ 
    this.HorizontalTwoByFour(this.support_length).rotateZ(90).rotateY(90).translate([2*this.twobyfour_thickness, 2*this.twobyfour_thickness, this.support_height-this.twobyfour_thickness]),
    this.FourtyFiveTwoByFour(this.cross_support_length).translate([2*this.twobyfour_thickness,this.table_depth-2*this.twobyfour_thickness, this.table_height-this.plywood_thickness]),
    this.FourtyFiveTwoByFour(this.cross_support_length).rotateZ(180).translate([4*this.twobyfour_thickness,2*this.twobyfour_thickness, this.table_height-this.plywood_thickness]),
    this.HorizontalTwoByFour(this.support_length).rotateZ(90).rotateY(90).translate([this.table_width-this.twobyfour_width-2*this.twobyfour_thickness, 2*this.twobyfour_thickness, this.support_height-this.twobyfour_thickness]),
    this.FourtyFiveTwoByFour(this.cross_support_length).translate([this.table_width-3*this.twobyfour_thickness,this.table_depth-2*this.twobyfour_thickness, this.table_height-this.plywood_thickness]),
    this.FourtyFiveTwoByFour(this.cross_support_length).rotateZ(180).translate([this.table_width-3*this.twobyfour_thickness,2*this.twobyfour_thickness, this.table_height-this.plywood_thickness])
    ];
}


WorkBench.prototype.Leg = function() {
    return this.VerticalTwoByFour(this.leg_length);
}

WorkBench.prototype.LeftFrontLeg = function() {
    return [ this.Leg().translate([this.twobyfour_thickness, this.twobyfour_thickness,0]), this.Leg().rotateZ(-90).translate([2*this.twobyfour_thickness, 2*this.twobyfour_thickness, 0]) ];
}

WorkBench.prototype.LeftBackLeg = function() {
    return [ this.Leg().translate([this.twobyfour_thickness, this.table_depth-this.twobyfour_width-this.twobyfour_thickness, 0]), this.Leg().rotateZ(-90).translate([2*this.twobyfour_thickness, this.table_depth-this.twobyfour_thickness, 0]) ];
}

WorkBench.prototype.RightFrontLeg = function() {
    return [ this.Leg().translate([this.table_width-2*this.twobyfour_thickness, this.twobyfour_thickness, 0]), this.Leg().rotateZ(-90).translate([this.table_width-2*this.twobyfour_thickness-this.twobyfour_width, 2*this.twobyfour_thickness, 0])  ];
}

WorkBench.prototype.RightBackLeg = function() {
    return [ this.Leg().translate([this.table_width-2*this.twobyfour_thickness, this.table_depth-this.twobyfour_width-this.twobyfour_thickness, 0]), this.Leg().rotateZ(-90).translate([this.table_width-2*this.twobyfour_thickness-this.twobyfour_width, this.table_depth-this.twobyfour_thickness, 0]) ];
}

WorkBench.prototype.TableTop = function() {
    var parts =  [ 
    this.HorizontalTwoByFour(this.table_width).translate([0,0,this.leg_length-this.twobyfour_width]), 
    this.HorizontalTwoByFour(this.table_width).translate([0,this.table_depth-this.twobyfour_thickness,this.leg_length-this.twobyfour_width]),
    this.HorizontalTwoByFour(this.yjoist_length).rotateZ(90).translate([this.twobyfour_thickness, this.twobyfour_thickness, this.leg_length-this.twobyfour_width]),
    this.HorizontalTwoByFour(this.yjoist_length).rotateZ(90).translate([this.table_width, this.twobyfour_thickness, this.leg_length-this.twobyfour_width]),
    cube([this.table_width, this.table_depth, this.plywood_thickness]).translate([0,0,this.leg_length])
    ];

    for(var i = 1; i < this.numYJoists-1; i++) {
        var x = i*(this.table_width-this.twobyfour_thickness)/(this.numYJoists-1);
        parts.push(this.HorizontalTwoByFour(this.yjoist_length).rotateZ(90).translate([this.twobyfour_thickness+x, this.twobyfour_thickness, this.leg_length-this.twobyfour_width]));
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
