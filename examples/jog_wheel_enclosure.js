// title      : Jog Wheel Enclosure
// author     : John Allwine
// license    : MIT License
// description: an enclosure for a rotary encoder that serves as a mouse wheel/jog wheel for the Pocket NC
// file       : jog_wheel_enclosure.jscad

function getParameterDefinitions() {
  return [
    { name: 'width', caption: 'Table Width', type: 'float', initial: 96 },
    { name: 'height', caption: 'Table Height', type: 'float', initial: 43 },
    { name: 'depth', caption: 'Table Depth', type: 'float', initial: 36 },
    { name: 'center_diameter', caption: 'Center Hole Diameter', type: 'float', initial: 43 },
    { name: 'sunken_diameter', caption: 'Sunken Diameter', type: 'float', initial: 60},
    { name: 'sunken_amount', caption: 'Sunken Depth', type: 'float', initial: 6.5},
    { name: 'mounting_holes', caption: 'Mounting Holes', type: 'int', initial: 3 },
    { name: 'mounting_holes_ring_diameter', caption: 'Mounting Holes Ring Diameter', type: 'float', initial: 55.5 },
    { name: 'mounting_holes_diameter', caption: 'Mounting Hole Diameter', type: 'float', initial: '3.5' }
  ];
}

function main(params) {
    var jogWheelEnclosure = new JogWheelEnclosure(params);

    var solid = jogWheelEnclosure.getSolid();
    
    return solid;
}

var JogWheelEnclosure = function(params) {
    this.params = params;
}

JogWheelEnclosure.prototype.getSolid = function() {
    return [ this.Top() ];
}


