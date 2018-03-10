// title      : Work Table
// author     : John Allwine
// license    : MIT License
// description: a standing work table
// file       : work_bench.jscad

function getParameterDefinitions() {
  return [
    { name: 'width', caption: 'Width', type: 'float', initial: 37.5 },
    { name: 'height', caption: 'Height', type: 'float', initial: 36 },
    { name: 'depth', caption: 'Depth', type: 'float', initial: 28.5 },
    { name: 'thickness', caption: 'Thickness', type: 'float', initial: .75 },

    { name: 'leftShelfWidthProportion', caption: 'Left Shelf Width Weight', type: 'slider', min: .01, max: 2, step: .01, initial: 1.01 },
    { name: 'rightShelfWidthProportion', caption: 'Right Shelf Width Weight', type: 'slider', min: .01, max: 2, step: .01, initial: 1 },

    { name: 'leftShelfProportion1', caption: 'Left Shelf #1 Weight', type: 'slider', min: 0, max: 2, step: .01, initial: 1 },
    { name: 'leftShelfProportion2', caption: 'Left Shelf #2 Weight', type: 'slider', min: 0, max: 2, step: .01, initial: 0 },
    { name: 'leftShelfProportion3', caption: 'Left Shelf #3 Weight', type: 'slider', min: 0, max: 2, step: .01, initial: 0 },

    { name: 'rightShelfProportion1', caption: 'Right Shelf #1 Weight', type: 'slider', min: 0, max: 2, step: .01, initial: 1 },
    { name: 'rightShelfProportion2', caption: 'Right Shelf #2 Weight', type: 'slider', min: 0, max: 2, step: .01, initial: 1 },
    { name: 'rightShelfProportion3', caption: 'Right Shelf #3 Weight', type: 'slider', min: 0, max: 2, step: .01, initial: 1 }
  ];
}

function main(params) {
    var cabinet = new Cabinet(params);

    var solid = cabinet.getSolid();
    
    return solid;
}

var Cabinet = function(params) {
    this.params = params;

    this.params.leftShelfWidthProportion = parseFloat(this.params.leftShelfWidthProportion);
    this.params.rightShelfWidthProportion = parseFloat(this.params.rightShelfWidthProportion);
    this.params.leftShelfProportion1 = parseFloat(this.params.leftShelfProportion1);
    this.params.leftShelfProportion2 = parseFloat(this.params.leftShelfProportion2);
    this.params.leftShelfProportion3 = parseFloat(this.params.leftShelfProportion3);
    this.params.rightShelfProportion1 = parseFloat(this.params.rightShelfProportion1);
    this.params.rightShelfProportion2 = parseFloat(this.params.rightShelfProportion2);
    this.params.rightShelfProportion3 = parseFloat(this.params.rightShelfProportion3);

    var widthTotal = this.params.leftShelfWidthProportion+this.params.rightShelfWidthProportion;
    var innerWidth = this.params.width-3*this.params.thickness;

    this.params.leftShelfWidth = Math.round(8*innerWidth*this.params.leftShelfWidthProportion/widthTotal)/8;
    this.params.rightShelfWidth = innerWidth-this.params.leftShelfWidth;

    console.log("Left Shelf Width: ", this.params.leftShelfWidth);
    console.log("Right Shelf Width: ", this.params.rightShelfWidth);

    var leftTotal = this.params.leftShelfProportion1+this.params.leftShelfProportion2+this.params.leftShelfProportion3;

    var leftHeights = [];
    if(this.params.leftShelfProportion1 != 0) {
      leftHeights.push(this.params.leftShelfProportion1);
    }

    if(this.params.leftShelfProportion2 != 0) {
      leftHeights.push(this.params.leftShelfProportion2);
    }
    
    if(this.params.leftShelfProportion3 != 0) {
      leftHeights.push(this.params.leftShelfProportion3);
    }

    var zeros = 3-leftHeights.length;

    var leftInnerHeight = this.params.height-(leftHeights.length+1)*this.params.thickness;

    var total = 0;
    for(var i = 0; i < leftHeights.length; i++) {
      if(i == leftHeights.length-1) {
        leftHeights[i] = leftInnerHeight-total;
      } else {
        leftHeights[i] = Math.round(8*(leftInnerHeight*leftHeights[i]/leftTotal))/8;
        total += leftHeights[i];
      }
      console.log("Left Shelf " + (i+1) + " Height: ", leftHeights[i]);
    }

    if(zeros == 0) {
      this.params.leftShelfHeight1 = 3*this.params.thickness+leftHeights[leftHeights.length-1]+leftHeights[leftHeights.length-2];
      this.params.leftShelfHeight2 = 2*this.params.thickness+leftHeights[leftHeights.length-1];
    } else if(zeros == 1) {
      this.params.leftShelfHeight1 = 2*this.params.thickness+leftHeights[leftHeights.length-1];
      this.params.noLeftShelf2 = true;
    } else if(zeros == 2) {
      this.params.noLeftShelf1 = true;
      this.params.noLeftShelf2 = true;
    }

    var rightTotal = this.params.rightShelfProportion1+this.params.rightShelfProportion2+this.params.rightShelfProportion3;

    var rightHeights = [];
    if(this.params.rightShelfProportion1 != 0) {
      rightHeights.push(this.params.rightShelfProportion1);
    }

    if(this.params.rightShelfProportion2 != 0) {
      rightHeights.push(this.params.rightShelfProportion2);
    }
    
    if(this.params.rightShelfProportion3 != 0) {
      rightHeights.push(this.params.rightShelfProportion3);
    }

    var zeros = 3-rightHeights.length;

    var rightInnerHeight = this.params.height-(rightHeights.length+1)*this.params.thickness;

    total = 0;
    for(var i = 0; i < rightHeights.length; i++) {
      if(i == rightHeights.length-1) {
        rightHeights[i] = rightInnerHeight-total;
      } else {
        rightHeights[i] = Math.round(8*(rightInnerHeight*rightHeights[i]/rightTotal))/8;
        total += rightHeights[i];
      }
      console.log("Right Shelf " + (i+1) + " Height: ", rightHeights[i]);
    }

    if(zeros == 0) {
      this.params.rightShelfHeight1 = 3*this.params.thickness+rightHeights[rightHeights.length-1]+rightHeights[rightHeights.length-2];
      this.params.rightShelfHeight2 = 2*this.params.thickness+rightHeights[rightHeights.length-1];
    } else if(zeros == 1) {
      this.params.rightShelfHeight1 = 2*this.params.thickness+rightHeights[rightHeights.length-1];
      this.params.noRightShelf2 = true;
    } else if(zeros == 2) {
      this.params.noRightShelf1 = true;
      this.params.noRightShelf2 = true;
    }

}

Cabinet.prototype.getSolid = function() {
    var parts = [ 

    ];
    
    // top
    parts.push(cube([this.params.width, this.params.depth, this.params.thickness]).translate([0,0,this.params.height-this.params.thickness]));

    // left side
    parts.push(cube([this.params.thickness, this.params.depth-this.params.thickness, this.params.height-2*this.params.thickness]).translate([0,0,this.params.thickness]));

    // right side
    parts.push(cube([this.params.thickness, this.params.depth-this.params.thickness, this.params.height-2*this.params.thickness]).translate([this.params.width-this.params.thickness, 0, this.params.thickness]));

    // middle
    parts.push(cube([this.params.thickness, this.params.depth-this.params.thickness, this.params.height-2*this.params.thickness]).translate([this.params.width-2*this.params.thickness-this.params.rightShelfWidth, 0, this.params.thickness]));

    // left shelf 1
    if(!this.params.noLeftShelf1) {
      parts.push(cube([this.params.leftShelfWidth, this.params.depth-this.params.thickness, this.params.thickness]).translate([this.params.thickness, 0, this.params.leftShelfHeight1-this.params.thickness]));
    }

    // left shelf 2
    if(!this.params.noLeftShelf2) {
      parts.push(cube([this.params.leftShelfWidth, this.params.depth-this.params.thickness, this.params.thickness]).translate([this.params.thickness, 0, this.params.leftShelfHeight2-this.params.thickness]));
    }

    // right shelf 1
    if(!this.params.noRightShelf1) {
      parts.push(cube([this.params.rightShelfWidth, this.params.depth-this.params.thickness, this.params.thickness]).translate([this.params.width-this.params.thickness-this.params.rightShelfWidth, 0, this.params.rightShelfHeight1-this.params.thickness]));
    }

    // right shelf 2
    if(!this.params.noRightShelf2) {
      parts.push(cube([this.params.rightShelfWidth, this.params.depth-this.params.thickness, this.params.thickness]).translate([this.params.width-this.params.thickness-this.params.rightShelfWidth, 0, this.params.rightShelfHeight2-this.params.thickness]));
    }

    // back
    parts.push(cube([this.params.width, this.params.thickness, this.params.height-2*this.params.thickness]).translate([0, this.params.depth-this.params.thickness, this.params.thickness]));

    // bottom
    parts.push(cube([this.params.width, this.params.depth, this.params.thickness]));
    
    return parts;
}
