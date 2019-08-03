// title      : Dowel Jig
// author     : John Allwine
// license    : MIT License
// description: a jig for making precise dowel holes
// file       : dowel_jig.jscad

function getParameterDefinitions() {
  return [
      { name: 'dowel_diameter', caption: 'Dowel Diameter', type: 'float', initial: .375 },
      { name: 'num_dowels', caption: 'Dowels', type: 'int', initial: 3 },
      { name: 'dowel_offset', caption: 'Offset', type: 'float', initial: .25 },
      { name: 'width', caption: 'Width', type: 'float', initial: 3.5 },
      { name: 'height', caption: 'Height', type: 'float', initial: 1.5 },
      { name: 'depth', caption: 'Depth', type: 'float', initial: 1 },
      { name: 'extra_height', caption: 'Extra Height', type: 'float', initial: 0 },
      { name: 'extra_width', caption: 'Extra Width', type: 'float', initial: 0 },
      { name: 'wing_sides', caption: 'Wing Sides', type: 'choice', values: [ "neither", "front", "back", "both" ], captions: ["Neither", "Front", "Back", "Both"], initial: "both" },
      { name: 'wing_vertical', caption: 'Vertical Wing', type: 'checkbox', checked: true },
      { name: 'wing_horizontal', caption: 'Horizontal Wing', type: 'checkbox', checked: true },
      { name: 'wing_depth', caption: 'Wing Depth', type: 'float', initial: 1 },
      { name: 'wing_thickness', caption: 'Wing Thickness', type: 'float', initial: .25 },
      { name: 'orient_for_3d_printing', caption: 'Orient Holes Up', type: 'checkbox', checked: false }
  ];
}


var inches2mm = 25.4;
function main(params) {
  params.width *= inches2mm;
  params.depth *= inches2mm;
  params.height *= inches2mm;
  params.dowel_diameter *= inches2mm;
  params.dowel_offset *= inches2mm;
  params.extra_width *= inches2mm;
  params.extra_height *= inches2mm;
  params.wing_thickness *= inches2mm;
  params.wing_depth *= inches2mm;

  var jig = cube({ size: [ params.width+params.extra_width, params.depth, params.height+params.extra_height ] });

  var dowels = [];
  for(var i = 0; i < params.num_dowels; i++) {
    dowels.push(cylinder({ r: params.dowel_diameter/2, h: params.depth+2 })
                  .translate([0,0,-1])
                  .rotateX(-90)
                  .translate([ params.width/(params.num_dowels+1)*(i+1)+params.extra_width, 0, params.height/2+( 2*((i%2)-.5)*params.dowel_offset+params.extra_height ) ]));

  }

  var wings = [ ];

  var extra_width_or_height = 0;
  if(params.wing_horizontal && params.wing_vertical) {
    extra_width_or_height = params.wing_thickness;
  }

  if(params.wing_sides === "front" || params.wing_sides === "both") {
    if(params.wing_horizontal) {
      wings.push(cube([ params.width + extra_width_or_height + params.extra_width, params.wing_depth+params.depth, params.wing_thickness ])
                  .translate([ -extra_width_or_height, -params.wing_depth, -params.wing_thickness ]));
    }

    if(params.wing_vertical) {
      wings.push(cube([ params.wing_thickness, params.wing_depth+params.depth, params.height + extra_width_or_height + params.extra_height ])
                  .translate([ -params.wing_thickness, -params.wing_depth, -extra_width_or_height ]));
    }
  }

  if(params.wing_sides === "back" || params.wing_sides === "both") {
    if(params.wing_horizontal) {
      wings.push(cube([ params.width + extra_width_or_height + params.extra_width, params.wing_depth+params.depth, params.wing_thickness ])
                  .translate([ -extra_width_or_height, 0, -params.wing_thickness ]));
    }

    if(params.wing_vertical) {
      wings.push(cube([ params.wing_thickness, params.wing_depth+params.depth, params.height + extra_width_or_height + params.extra_height])
                  .translate([ -params.wing_thickness, 0, -extra_width_or_height ]));
    }
  }

  var jig = union(jig.subtract(dowels), wings);

  if(params.orient_for_3d_printing) {
    if(params.wing_sides === "front") {
      return jig.rotateX(-90);
    } else {
      return jig.rotateX(90);
    }
  }

  return jig;
}
