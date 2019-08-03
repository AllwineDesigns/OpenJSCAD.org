// title      : Work Table
// author     : John Allwine
// license    : MIT License
// description: a work table
// file       : work_table.jscad

include('greedy_stock_problem.js');
include('packer.js');

function getParameterDefinitions() {
  return [
    { name: 'width', caption: 'Table Width', type: 'float', initial: 72 },
    { name: 'height', caption: 'Table Height', type: 'float', initial: 30 },
    { name: 'depth', caption: 'Table Depth', type: 'float', initial: 36.25 },
    { name: 'overhang', caption: 'Overhang', type: 'float', initial: 2.5 },
//    { name: 'table_top_joint', caption: 'Table Top Joint Type', type: 'choice', values: [ 'pocket_screws', 'dowel_pins', 'glue' ], captions: ['Pocket Screws', 'Dowel Pins', 'Glue Only' ], initial: 'glue' },
//    { name: 'joint_type', caption: 'Apron Joint Type', type: 'choice', values: [ 'pocket_screws', 'dowel_pins', 'mortise_and_tenon' ], captions: ['Pocket Screws', 'Dowel Pins', 'Mortise and Tenon' ], initial: 'dowel_pins' },
//    { name: 'attachment', caption: 'Table Top Attachment', type: 'choice', values: [ 'pocket_screws', 'metal_clips' ], captions: ['Pocket Screws', 'Metal Clips' ], initial: 'metal_clips' },
    { name: 'rip_cuts', caption: 'Use Rip Cuts', type: 'checkbox', checked: false },
    { name: 'use_tenons', caption: 'Use Tenons', type: 'checkbox', checked: false }
  ];
}

function main(params) {
    var simpleTable = new SimpleTable(params);

    var solid = simpleTable.getSolid();
    
    return solid;
}

var SimpleTable = function(params) {
    this.table_height = params.height;
    this.table_width = params.width;
    this.overhang = params.overhang;
    this.rip_cuts = params.rip_cuts;

    this.joint_type = params.use_tenons ? 'mortise_and_tenon' : 'dowel_pins';
    this.table_top_joint = 'dowel_pins';
    this.attachment = 'metal_clips';

//    this.joint_type = params.joint_type;
//    this.table_top_joint = params.table_top_joint;
//    this.attachment = params.attachment;

    this.apron_thickness = 1.5;
    this.apron_width = 3.5;
    this.apron_edge_radius = .125;
    this.apron_inset = .375;

    this.post_thickness = 3.5;
    this.post_width = 3.5;
    this.post_edge_radius = .125;

    this.table_top_board_thickness = 1.5;
    this.table_top_board_width = 7.25;
    this.table_top_board_edge_radius = .125;

    if(this.rip_cuts) {
        this.table_depth = params.depth;
    } else {
        this.table_depth = Math.round(params.depth/this.table_top_board_width)*this.table_top_board_width;
    }
    this.num_boards = Math.ceil(this.table_depth/this.table_top_board_width);
    this.rip_thickness = this.table_top_board_width*this.num_boards-this.table_depth;
    this.rip_thickness_per_edge = this.rip_thickness/this.num_boards*.5;

    if(this.rip_cuts) {
        this.table_top_board_width -= 2*this.rip_thickness_per_edge;

        this.table_top_board_edge_radius = Math.max(.03, this.table_top_board_edge_radius-this.rip_thickness_per_edge);
    }

    this.leg_length = this.table_height-this.table_top_board_thickness;
    this.x_apron_length = this.table_width-2*this.post_thickness-2*this.overhang;
    this.y_apron_length = this.table_depth-2*this.post_width-2*this.overhang;

    this.oversize = .1;

    this.checkErrors();

    var cuts2x4 = [
        { 
            cut_length: this.x_apron_length+(this.joint_type == 'mortise_and_tenon' ? 5 : 0),
            count: 2,
            id: 'x_apron'
        },
        { 
            cut_length: this.y_apron_length+(this.joint_type == 'mortise_and_tenon' ? 5 : 0),
            count: 2,
            id: 'y_apron'
        }
    ];
    var cuts4x4 = [
        { 
            cut_length: this.leg_length,
            count: 4,
            id: 'legs'
        }
    ];
    var cuts2x8 = [
        { 
            cut_length: this.table_width,
            count: this.num_boards,
            id: 'table_top'
        }
    ];

    // 2x4s
    var order = new CuttingStockOrder(cuts2x4, 96);
    var order2 = new CuttingStockOrder(cuts2x4, 96, .125, "MIN_WASTE"); 
    if(order2.cutlist.length < order.cutlist.length) {
        order = order2;
    }

    var cutlist2x4 = order.cutlist;
    var labels = {
        legs: 'A',
        x_apron: 'B',
        y_apron: 'C',
        table_top: 'D'
    };
    for(var i = 0; i < cutlist2x4.length; i++) {
        for(var j = 0; j < cutlist2x4[i].length; j++) {
            cutlist2x4[i][j].label = labels[cutlist2x4[i][j].id];
        }
    }

    // 4x4s
    order = new CuttingStockOrder(cuts4x4, 96);
    order2 = new CuttingStockOrder(cuts4x4, 96, .125, "MIN_WASTE"); 
    if(order2.cutlist.length < order.cutlist.length) {
        order = order2;
    }

    var cutlist4x4 = order.cutlist;
    for(var i = 0; i < cutlist4x4.length; i++) {
        for(var j = 0; j < cutlist4x4[i].length; j++) {
            cutlist4x4[i][j].label = labels[cutlist4x4[i][j].id];
        }
    }

    // 2x8s
    order = new CuttingStockOrder(cuts2x8, 96);
    order2 = new CuttingStockOrder(cuts2x8, 96, .125, "MIN_WASTE"); 
    if(order2.cutlist.length < order.cutlist.length) {
        order = order2;
    }

    var cutlist2x8 = order.cutlist;
    for(var i = 0; i < cutlist2x8.length; i++) {
        for(var j = 0; j < cutlist2x8[i].length; j++) {
            cutlist2x8[i][j].label = labels[cutlist2x8[i][j].id];
        }
    }

    var message = {
        materials: {
            '2x4': cutlist2x4,
            '4x4': cutlist4x4,
            '2x8': cutlist2x8,
            'dowel_pins': 0,
            'pocket_screws': 0,
            'metal_clips': 0

        },
        dimensions: [
            { dimension: this.table_depth, id: 'table_depth', label: 'I', description: "The actual depth of the table. This will only match what you specified in the widget above if you allow rip cuts, or pick a number that is evenly divided by 7.25." }
        ]
    };

    if(this.attachment == 'pocket_screws') {
        message.materials.pocket_screws += 2*Math.floor(this.y_apron_length/8);
    } else if(this.attachment == 'metal_clips') {
        message.materials.metal_clips += 2*Math.max(Math.floor(this.y_apron_length/8), 2);
    }

    if(this.table_top_joint == 'dowel_pins') {
        message.materials.dowel_pins += Math.floor(this.table_width/8);
    } else if(this.table_top_joint == 'pocket_screws') {
        message.materials.pocket_screws += Math.floor(this.table_width/8);
    }

    if(this.joint_type == 'dowel_pins') {
        message.materials.dowel_pins += 24;
    } else if(this.joint_type == 'pocket_screws') {
        message.materials.pocket_screws += 16;
    }

    if(this.rip_cuts) {
        message.dimensions.push({ dimension: this.rip_thickness_per_edge, id: 'rip_thickness_per_edge', label: 'II', description: "The amount to cut off each side of every 2x8. You could double this number and make a single cut, but cutting from each edge will eliminate the rounded edges from both sides rather than just one." });
        message.dimensions.push({ dimension: this.rip_thickness, id: 'rip_thickness', label: 'III', description: "If you'd rather not cut every board, and don't mind a single board being a different width than the rest of them, you can cut this amount off of a single 2x8 to get your desired depth." });
    }

    var kerf = .125;

    console.log(message);

    postMessage({ cmd: 'windowMessage', message: message });
};

SimpleTable.prototype.checkErrors = function() {
    if(this.table_height > 97.5) {
        throw new Error("Table height maximum is 97.5.");
    }
    if(this.table_height < 5) {
        throw new Error("Table height minimum is 5.");
    }

    if(this.table_width > 96) {
        throw new Error("Table width maximum is 96.");
    }
    if(this.table_width < 11) {
        throw new Error("Table width minimum is 11.");
    }
    if(this.table_depth > 98) {
        throw new Error("Table depth maximum is 98.");
    }
    if(this.table_depth < 11) {
        throw new Error("Table depth minimum is 11.");
    }
    if(this.overhang < 0) {
        throw new Error("The minimum overhang is 0.");
    }

    if(this.table_width-2*this.post_thickness-2*this.overhang < 3 ||
        this.table_depth-2*this.post_width-2*this.overhang < 3) {
        var m = Math.min(.5*(this.table_width-2*this.post_thickness-3), .5*(this.table_depth-2*this.post_width-3));
        throw new Error("Overhang is too large, with the current width and depth the maximum is " + m + ".");
    }
}

SimpleTable.prototype.getSolid = function() {
    var parts = [ this.LeftBackLeg(), this.LeftFrontLeg(), this.RightBackLeg(), this.RightFrontLeg() ];

    Array.prototype.push.apply(parts, this.TableTop());
    Array.prototype.push.apply(parts, this.Apron());

    return parts;
}

SimpleTable.prototype.Apron = function() {
    var parts = [];

    parts.push(this.ApronBoard(this.x_apron_length).translate([this.post_thickness+this.overhang, this.overhang+this.apron_inset, this.leg_length-this.apron_width]));
    parts.push(this.ApronBoard(this.x_apron_length).translate([this.post_thickness+this.overhang, this.table_depth-this.overhang-this.apron_thickness-this.apron_inset, this.leg_length-this.apron_width]));
    parts.push(this.ApronBoard(this.y_apron_length).rotateZ(90).translate([this.overhang+this.apron_thickness+this.apron_inset,this.overhang+this.post_width,this.leg_length-this.apron_width]));
    parts.push(this.ApronBoard(this.y_apron_length).rotateZ(90).translate([this.table_width-this.overhang-this.apron_inset,this.overhang+this.post_width,this.leg_length-this.apron_width]));

    return parts;
}

SimpleTable.prototype.TableTop = function() {
    var parts = [];

    for(var i = 0; i < this.num_boards; i++) {
        parts.push(this.TableTopBoard(this.table_width).translate([0,this.table_top_board_width*i,this.leg_length]));
    }

    return parts;
}

SimpleTable.prototype.LeftFrontLeg = function() {
    return this.Post(this.leg_length).translate([this.overhang, this.overhang, 0]);
}

SimpleTable.prototype.LeftBackLeg = function() {
    return this.Post(this.leg_length).translate([this.overhang, this.y_apron_length+this.post_width+this.overhang, 0])
}

SimpleTable.prototype.RightFrontLeg = function() {
    return this.Post(this.leg_length).translate([this.post_thickness+this.x_apron_length+this.overhang, this.overhang, 0]);
}

SimpleTable.prototype.RightBackLeg = function() {
    return this.Post(this.leg_length).translate([this.post_thickness+this.x_apron_length+this.overhang, this.y_apron_length+this.post_width+this.overhang, 0]);
}

SimpleTable.prototype.Post = function(length) {
    var corners = [
        circle({ r: this.post_edge_radius }),
        circle({ r: this.post_edge_radius }).translate([this.post_thickness-2*this.post_edge_radius, 0,0]),
        circle({ r: this.post_edge_radius }).translate([this.post_thickness-2*this.post_edge_radius, this.post_width-2*this.post_edge_radius,0]),
        circle({ r: this.post_edge_radius }).translate([0, this.post_width-2*this.post_edge_radius,0]),
    ];

    return linear_extrude({height: length}, hull(corners));
}

SimpleTable.prototype.ApronBoard = function(length) {
    var corners = [
        circle({ r: this.apron_edge_radius }),
        circle({ r: this.apron_edge_radius }).translate([this.apron_thickness-2*this.apron_edge_radius, 0,0]),
        circle({ r: this.apron_edge_radius }).translate([this.apron_thickness-2*this.apron_edge_radius, this.apron_width-2*this.apron_edge_radius,0]),
        circle({ r: this.apron_edge_radius }).translate([0, this.apron_width-2*this.apron_edge_radius,0]),
    ];

    return linear_extrude({height: length}, hull(corners)).rotateY(90).rotateX(90);
}

SimpleTable.prototype.TableTopBoard = function(length) {
    var corners = [
        circle({ r: this.table_top_board_edge_radius }),
        circle({ r: this.table_top_board_edge_radius }).translate([this.table_top_board_thickness-2*this.table_top_board_edge_radius, 0,0]),
        circle({ r: this.table_top_board_edge_radius }).translate([this.table_top_board_thickness-2*this.table_top_board_edge_radius, this.table_top_board_width-2*this.table_top_board_edge_radius,0]),
        circle({ r: this.table_top_board_edge_radius }).translate([0, this.table_top_board_width-2*this.table_top_board_edge_radius,0]),
    ];

    return linear_extrude({height: length}, hull(corners)).rotateY(90).translate([0,0,this.table_top_board_thickness]);
}
