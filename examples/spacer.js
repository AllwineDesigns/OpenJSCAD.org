function getParameterDefinitions() {
  return [
    { name: 'bottomD', caption: 'Base Diameter', type: 'float', initial: 25.13 },
    { name: 'bottomH', caption: 'Base Thickness', type: 'float', initial: 2.57 },
    { name: 'middleD', caption: 'Gap Diameter', type: 'float', initial: 11.56 },
    { name: 'gap', caption: 'Gap Size', type: 'float', initial: 2 },
    { name: 'topD', caption: 'Top Diameter', type: 'float', initial: 14.14 },
    { name: 'totalH', caption: 'Spacer Height', type: 'float', initial: 5.83 },
    { name: 'holeD', caption: 'Hole Diameter', type: 'float', initial: 4.76 },
    { name: 'chamferD', caption: 'Chamfer Diam.', type: 'float', initial: 8.2 },
    { name: 'chamferDepth', caption: 'Chamfer Inset', type: 'float', initial: .5 }
  ];
}

function main(params) {
  var bottomR = params.bottomD*.5;
  var bottomH = params.bottomH;
  var middleR = params.middleD*.5;
  var topR = params.topD*.5;
  var middleGap = params.gap;
  var totalH = params.totalH;
  var holeR = params.holeD*.5;
  var topHoleR = params.chamferD*.5;
  var inset = params.chamferDepth;

   return color("gray", difference(union(
       cylinder({ r: bottomR, h: bottomH}),
       cylinder({ r: middleR, h: totalH}),
       cylinder({ r: topR, h: totalH-middleGap-bottomH}).translate([0,0,bottomH+middleGap])
   ),
   cylinder({r: holeR, h: totalH+2}).translate([0,0,-1]),
   cylinder({r1: holeR, r2: topHoleR, h: topHoleR-holeR}).translate([0,0,totalH-(topHoleR-holeR)-inset]),
   cylinder({r: topHoleR, h: inset+1}).translate([0,0,totalH-inset])
   ))
}

