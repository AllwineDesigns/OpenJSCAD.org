function getParameterDefinitions() {
    return [
        { name: 'inner_diameter', caption: 'Inner Diameter', type: 'float', initial: .25 },
        { name: 'thickness', caption: 'Thickness', type: 'float', initial: .125 }, 
        { name: 'length', caption: 'Connector Length', type: 'float', initial: .25 },
        { name: 'hole_depth', caption: 'Hole Depth', type: 'float', initial: .2 },
        { name: 'number', caption: 'Number', type: 'text', initial: "1" },
        { name: 'dowel_angle', caption: 'Dowel Angle', type: 'float', initial: 90 },
        { name: 'marker_angle', caption: 'Marker Angle', type: 'float', inital: 0 }
    ];
}

function main(params) {
    var connector = new Connector(params);

    return connector.getSolid();
}


var inches2mm = 25.4;
var Connector = function(params) {
    this.angle = params.dowel_angle;
    this.height = params.length*inches2mm;
    this.hole_depth = params.hole_depth*inches2mm;
    this.inner_diameter = params.inner_diameter*inches2mm;
    this.outer_diameter = (params.inner_diameter+params.thickness*2)*inches2mm;
    this.marker_angle = params.marker_angle;
    this.number = params.number;
}

Connector.prototype.getSolid = function() {
    var l = vector_text(0,0,this.number);   // l contains a list of polylines to be drawn
    var o = [];
    l.forEach(function(pl) {                   // pl = polyline (not closed)
       o.push(rectangular_extrude(pl, {w: 4, h: 4}));   // extrude it to 3D
    });
    var text_solid = union(o).scale(.25).rotateX(180).center();
    return hull(
        cylinder({r: this.outer_diameter/2, h: this.height }).rotateX(this.angle/2).translate([0,0,this.outer_diameter/2]),
        cylinder({r: this.outer_diameter/2, h: this.height }).rotateX(-this.angle/2).translate([0,0,this.outer_diameter/2]),
        cylinder({r: this.outer_diameter/2, h:1 })
    ).subtract(
        cube({ size: [this.outer_diameter+2, 1, 5], center: true }).
          translate([-this.outer_diameter/2-1, 0, this.height]).
          rotateZ(90-this.marker_angle).
          rotateX(this.angle/2).
          translate([0,0,this.outer_diameter/2]).
            subtract(cylinder({ r: this.outer_diameter/2-.5, h: this.height }).
                       rotateX(this.angle/2).
                       translate([0,0,this.outer_diameter/2])
                    )
        ).subtract(
            cube({ size: [this.outer_diameter+2, 1, 5], center: true }).
              translate([-this.outer_diameter/2-1, 0, this.height]).
              rotateZ(-90).
              rotateX(-this.angle/2).
              translate([0,0,this.outer_diameter/2]).subtract(
                cylinder({ r: this.outer_diameter/2-.5, h: this.height }).
                  rotateX(-this.angle/2).
                  translate([0,0,this.outer_diameter/2])
              )
        ).subtract(
            cylinder({r: this.inner_diameter/2, h: this.height}).
              translate([0,0,this.height-this.hole_depth]).
              rotateX(this.angle/2).
              translate([0,0,this.outer_diameter/2])
        ).subtract(
            cylinder({r: this.inner_diameter/2, h: this.height}).
              translate([0,0,this.height-this.hole_depth]).
              rotateX(-this.angle/2).
              translate([0,0,this.outer_diameter/2])
        ).subtract(text_solid);
}


