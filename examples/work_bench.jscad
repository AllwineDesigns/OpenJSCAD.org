// title      : Work Table
// author     : John Allwine
// license    : MIT License
// description: a work table
// file       : work_table.jscad

function getParameterDefinitions() {
  return [
    { name: 'width', caption: 'Table Width', type: 'float', initial: 96 },
    { name: 'height', caption: 'Table Height', type: 'float', initial: 36 },
    { name: 'depth', caption: 'Table Depth', type: 'float', initial: 36 }
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

    this.plywood_thickness = .75;
    this.twobyfour_thickness = 1.5;
    this.twobyfour_width = 3.5;
    this.twobyfour_edge_radius = .125;
    

    this.leg_length = this.table_height-this.plywood_thickness;
    this.cross_support_length = Math.round(8*(sqrt(2)*.5*(this.table_depth-4*this.twobyfour_thickness)+this.twobyfour_width))/8;
    this.support_height = this.table_height-this.plywood_thickness-this.cross_support_length*Math.sqrt(2)*.5;

    this.support_length = this.table_depth-4*this.twobyfour_thickness;
    this.oversize = .1;

    this.yjoist_length = this.table_depth-2*this.twobyfour_thickness;

    this.numYJoists = Math.ceil((this.table_width-this.twobyfour_thickness)/24)+1;
    this.spaceBetween = (this.table_width-this.twobyfour_thickness)/this.numYJoists;
    console.log(this.numYJoists)
    console.log(this.spaceBetween);

    this.checkErrors();

    var message = {
        materials: {
            '2x4': {},
            'plywood': [
                {
                    cutWidth: this.table_width,
                    cutDepth: this.table_depth
                }
            ]
        }
    };

    message.materials['2x4'][this.yjoist_length] = this.numYJoists;
    message.materials['2x4'][this.leg_length] = 8;
    message.materials['2x4'][this.support_length] = 2;
    message.materials['2x4'][this.cross_support_length] = 4;
    message.materials['2x4'][this.table_width] = 2;

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

    var allParts = [];

    for(var i = 0; i < partLists.length; i++) {
        Array.prototype.push.apply(allParts, partLists[i]);
    }

    return allParts;
}

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

WorkBench.prototype.FourtyFiveTwoByFour = function(length) {
    var len_sqrt2 = length/sqrt(2);
    return this.VerticalTwoByFour(length).rotateX(-45).subtract(cube(2*this.twobyfour_width).translate([0,0,-2*this.twobyfour_width])).subtract(cube(2*this.twobyfour_width).translate([0,len_sqrt2, len_sqrt2-2*this.twobyfour_width])).translate([0,-len_sqrt2,-len_sqrt2]);
}
