// title      : shelf
// author     : John Allwine
// license    : MIT License
// description: a plywood shelf with up to 6 shelves
// file       : shelf.jscad

include('packer.js');

function getParameterDefinitions() {
  return [
    { name: 'width', caption: 'Width', type: 'float', initial: 37.75 },
    { name: 'height', caption: 'Height', type: 'float', initial: 32 },
    { name: 'depth', caption: 'Depth', type: 'float', initial: 29.25 },
    { name: 'thickness', caption: 'Thickness', type: 'float', initial: .75 },
//    { name: 'overhangLeft', caption: 'Overhang Left', type: 'float', initial: 0 },
//    { name: 'overhangBack', caption: 'Overhang Back', type: 'float', initial: 0 },
//    { name: 'overhangRight', caption: 'Overhang Right', type: 'float', initial: 0 },
//    { name: 'overhangFront', caption: 'Overhang Front', type: 'float', initial: 0 },
    { name: 'dadoDepth', caption: 'Dado Depth', type: 'float', initial: .25 },

    { name: 'shelfDivider', caption: 'Vertical Divider', type: 'slider', min: 0, max: 1, step: .001, initial: .5, label: false },

    { name: 'leftShelfDivider1', caption: 'Left Shelf #1', type: 'slider', min: 0, max: 1, step: .001, initial: .596, label: false },
    { name: 'leftShelfDivider2', caption: 'Left Shelf #2', type: 'slider', min: 0, max: 1, step: .001, initial: 0, label: false },

    { name: 'rightShelfDivider1', caption: 'Right Shelf #1', type: 'slider', min: 0, max: 1, step: .001, initial: .907, label: false },
    { name: 'rightShelfDivider2', caption: 'Right Shelf #2', type: 'slider', min: 0, max: 1, step: .001, initial: .452, label: false },

    { name: 'sheetWidth', caption: 'Sheet Width', type: 'float', initial: 96 },
    { name: 'sheetHeight', caption: 'Sheet Height', type: 'float', initial: 48 },

  ];
}

function main(params) {
    var shelf = new Shelf(params);

    var solid = shelf.getSolid();
    
    return solid;
}

var Shelf = function(params) {
    this.params = params;

    this.params.overhangLeft = 0;
    this.params.overhangRight = 0;
    this.params.overhangBack = 0;
    this.params.overhangFront = 0;

    var widthTotal = this.params.leftShelfWidthProportion+this.params.rightShelfWidthProportion;
    var innerWidth = this.params.width-3*this.params.thickness-this.params.overhangLeft-this.params.overhangRight;

    console.log(this.params.shelfDivider);
    if(this.params.shelfDivider == 0) {
      this.params.noLeftShelf = true;
      this.params.rightShelfWidth = innerWidth+this.params.thickness;
    } else if(this.params.shelfDivider == 1) {
      console.log("shelf divider is 1");
      this.params.leftShelfWidth = innerWidth+this.params.thickness;
      this.params.noRightShelf = true;
    } else {
      this.params.leftShelfWidth = Math.min(Math.max(.125, Math.round(8*this.params.shelfDivider*innerWidth)/8), innerWidth-.125);
      this.params.rightShelfWidth = innerWidth-this.params.leftShelfWidth;
    }

    console.log("Left Shelf Width: ", this.params.leftShelfWidth);
    console.log("Right Shelf Width: ", this.params.rightShelfWidth);

    var leftInnerHeight = this.params.height-3*this.params.thickness;

    var minShelfHeight = .125;

    this.params.leftShelfHeight1 = Math.round(8*Math.max(minShelfHeight+2*this.params.thickness, Math.min(this.params.height-this.params.thickness-minShelfHeight, leftInnerHeight*this.params.leftShelfDivider1+this.params.thickness)))/8;
    this.params.leftShelfHeight2 = Math.round(8*Math.max(minShelfHeight+2*this.params.thickness, Math.min(this.params.height-this.params.thickness-minShelfHeight, leftInnerHeight*this.params.leftShelfDivider2+this.params.thickness)))/8;

    var leftShelves = 3;

    if(this.params.leftShelfDivider1 == 0 || this.params.leftShelfDivider1 == 1) {
      this.params.noLeftShelf1 = true;
      leftShelves--;
    }

    if(this.params.leftShelfDivider2 == 0 || this.params.leftShelfDivider2 == 1 || Math.abs(this.params.leftShelfHeight1-this.params.leftShelfHeight2) < this.params.thickness+minShelfHeight) {
      this.params.noLeftShelf2 = true;
      leftShelves--;
    }

    var max = Math.max(this.params.leftShelfHeight1, this.params.leftShelfHeight2);
    var min = Math.min(this.params.leftShelfHeight1, this.params.leftShelfHeight2);
    if(leftShelves == 3) {
      this.params.leftShelfHeight1 = max;
      this.params.leftShelfHeight2 = min;
    } else if(leftShelves == 2) {
      this.params.leftShelfHeight1 = max;
    }

    var rightInnerHeight = this.params.height-3*this.params.thickness;
    var rightShelves = 3;

    this.params.rightShelfHeight1 = Math.round(8*Math.max(minShelfHeight+2*this.params.thickness, Math.min(this.params.height-this.params.thickness-minShelfHeight, rightInnerHeight*this.params.rightShelfDivider1+this.params.thickness)))/8;
    this.params.rightShelfHeight2 = Math.round(8*Math.max(minShelfHeight+2*this.params.thickness, Math.min(this.params.height-this.params.thickness-minShelfHeight, rightInnerHeight*this.params.rightShelfDivider2+this.params.thickness)))/8;

    if(this.params.rightShelfDivider1 == 0 || this.params.rightShelfDivider1 == 1) {
      this.params.noRightShelf1 = true;
      rightShelves--;
    }

    if(this.params.rightShelfDivider2 == 0 || this.params.rightShelfDivider2 == 1 || Math.abs(this.params.rightShelfHeight1-this.params.rightShelfHeight2) < this.params.thickness+minShelfHeight) {
      this.params.noRightShelf2 = true;
      rightShelves--;
    }

    max = Math.max(this.params.rightShelfHeight1, this.params.rightShelfHeight2);
    min = Math.min(this.params.rightShelfHeight1, this.params.rightShelfHeight2);
    if(rightShelves == 3) {
      this.params.rightShelfHeight1 = max;
      this.params.rightShelfHeight2 = min;
    } else if(rightShelves == 2) {
      this.params.rightShelfHeight1 = max;
    }

    this.params.innerDepth = this.params.depth-this.params.thickness-this.params.overhangBack-this.params.overhangFront;

    var message = {
        materials: {
            'plywood': []
        },
        dimensions: []
    };
    var kerf = .125;
    var blocks = [ ];

    blocks.push({ w: this.params.height-2*this.params.thickness+2*this.params.dadoDepth+kerf, h: this.params.innerDepth+this.params.dadoDepth+kerf, id: 'left', label: 'Left' });
    blocks.push({ w: this.params.height-2*this.params.thickness+2*this.params.dadoDepth+kerf, h: this.params.innerDepth+this.params.dadoDepth+kerf, id: 'right', label: 'Right' });

    var hasMiddle = !this.params.noLeftShelf && !this.params.noRightShelf;
    if(hasMiddle) {
      blocks.push({ w: this.params.height-2*this.params.thickness+2*this.params.dadoDepth+kerf, h: this.params.innerDepth+this.params.dadoDepth+kerf, id: 'middle', label: 'Middle' });
    }

    if(!this.params.noLeftShelf) {
      if(!this.params.noLeftShelf1) {
        blocks.push({ w: this.params.leftShelfWidth+2*this.params.dadoDepth+kerf, h: this.params.innerDepth+this.params.dadoDepth+kerf, id: 'leftShelf1', label: 'Left Shelf #1' });
      }
      if(!this.params.noLeftShelf2) {
        blocks.push({ w: this.params.leftShelfWidth+2*this.params.dadoDepth+kerf, h: this.params.innerDepth+this.params.dadoDepth+kerf, id: 'leftShelf2', label: 'Left Shelf #2' });
      }
    }

    if(!this.params.noRightShelf) {
      if(!this.params.noRightShelf1) {
        blocks.push({ w: this.params.rightShelfWidth+2*this.params.dadoDepth+kerf, h: this.params.innerDepth+this.params.dadoDepth+kerf, id: 'rightShelf1', label: 'Right Shelf #1' });
      }
      if(!this.params.noRightShelf2) {
        blocks.push({ w: this.params.rightShelfWidth+2*this.params.dadoDepth+kerf, h: this.params.innerDepth+this.params.dadoDepth+kerf, id: 'rightShelf2', label: 'Right Shelf #2' });
      }
    }

    blocks.push({ h: this.params.width-this.params.overhangLeft-this.params.overhangRight+kerf, w: this.params.height-2*this.params.thickness+2*this.params.dadoDepth+kerf, id: 'back', label: 'Back' });

    blocks.push({ w: this.params.width+kerf, h: this.params.depth+kerf, id: 'top', label: 'Top' });
    blocks.push({ w: this.params.width-this.params.overhangLeft-this.params.overhangRight+kerf, h: this.params.innerDepth+this.params.thickness+kerf, id: 'bottom', label: 'Bottom' });

    blocks.sort(function(a,b) {
//      return a.w-b.w;
      return b.h-a.h;
//      return Math.max(b.h, b.w)-Math.max(a.h, a.w);
//      return b.h*b.w-a.h*a.w;
    });

    for(var i = 0; i < blocks.length; i++) {
      var tmp = blocks[i].w;
      blocks[i].w = blocks[i].h;
      blocks[i].h = tmp;
    }


    var attempts = 0;
    var total_attempts = blocks.length;
    var sheets = [];
    while(blocks.length > 0 && attempts < total_attempts) {
//        var packer = new Packer(96+kerf, 48+kerf);
//        var packer = new Packer(48+kerf, 96+kerf);
        var packer = new Packer(this.params.sheetWidth+kerf, this.params.sheetHeight+kerf);
        var sheet = [];
        packer.fit(blocks);

        var did_not_fit = [];

        for(var n = 0; n < blocks.length; n++) {
            var block = blocks[n];
            if(block.fit) {
                sheet.push({ h: block.w-kerf, w: block.h-kerf, y: block.fit.x, x: block.fit.y, id: block.id, label: block.label });
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

    var leftHeights = [];

    if(leftShelves == 3) {
      leftHeights.push(this.params.height-this.params.thickness-this.params.leftShelfHeight1);
      leftHeights.push(this.params.leftShelfHeight1-this.params.thickness-this.params.leftShelfHeight2);
      leftHeights.push(this.params.leftShelfHeight2-this.params.thickness-this.params.thickness);
    } else if(leftShelves == 2) {
      leftHeights.push(this.params.height-this.params.thickness-this.params.leftShelfHeight1);
      leftHeights.push(this.params.leftShelfHeight1-this.params.thickness-this.params.thickness);
    } else {
      leftHeights.push(this.params.height-this.params.thickness-this.params.thickness);
    }

    var rightHeights = [];

    if(rightShelves == 3) {
      rightHeights.push(this.params.height-this.params.thickness-this.params.rightShelfHeight1);
      rightHeights.push(this.params.rightShelfHeight1-this.params.thickness-this.params.rightShelfHeight2);
      rightHeights.push(this.params.rightShelfHeight2-this.params.thickness-this.params.thickness);
    } else if(rightShelves == 2) {
      rightHeights.push(this.params.height-this.params.thickness-this.params.rightShelfHeight1);
      rightHeights.push(this.params.rightShelfHeight1-this.params.thickness-this.params.thickness);
    } else {
      rightHeights.push(this.params.height-this.params.thickness-this.params.thickness);
    }


    if(hasMiddle || !this.params.noLeftShelf) {
      message.dimensions.push({ dimension: this.params.leftShelfWidth, id: 'leftShelfWidth', label: 'Left Shelf Width' });
    }
    for(var i = 0; i < leftHeights.length; i++) {
      message.dimensions.push({ dimension: leftHeights[i], id: 'leftShelfHeight' + (i+1), label: 'Left Shelf Height #' + (i+1) });
    }

    if(hasMiddle || !this.params.noLeftShelf) {
      message.dimensions.push({ dimension: this.params.rightShelfWidth, id: 'rightShelfWidth', label: 'Right Shelf Width' });
    }

    for(var i = 0; i < rightHeights.length; i++) {
      message.dimensions.push({ dimension: rightHeights[i], id: 'rightShelfHeight' + (i+1), label: 'Right Shelf Height #' + (i+1) });
    }

    message.dimensions.push({ dimension: this.params.sheetWidth, id: 'sheetWidth', label: 'Plywood Sheet Width' });
    message.dimensions.push({ dimension: this.params.sheetHeight, id: 'sheetHeight', label: 'Plywood Sheet Height' });

    console.log(message);
    postMessage({ cmd: 'windowMessage', message: message });
}

Shelf.prototype.Top = function(r) {
  return cube({ size: [this.params.width, this.params.depth, this.params.thickness], radius: r }).translate([0,0,this.params.height-this.params.thickness]);
};

Shelf.prototype.Left = function(r) {
  return cube({ size: [this.params.thickness, this.params.innerDepth+this.params.dadoDepth, this.params.height-2*this.params.thickness+2*this.params.dadoDepth], radius: r}).translate([this.params.overhangLeft,this.params.overhangFront,this.params.thickness-this.params.dadoDepth]);
};

Shelf.prototype.Right = function(r) {
  return cube({ size: [this.params.thickness, this.params.innerDepth+this.params.dadoDepth, this.params.height-2*this.params.thickness+2*this.params.dadoDepth], radius: r}).translate([this.params.width-this.params.thickness-this.params.overhangRight, this.params.overhangFront, this.params.thickness-this.params.dadoDepth]);
};

Shelf.prototype.Middle = function(r) {
  return cube({ size: [this.params.thickness, this.params.innerDepth+this.params.dadoDepth, this.params.height-2*this.params.thickness+2*this.params.dadoDepth], radius: r}).translate([this.params.width-2*this.params.thickness-this.params.rightShelfWidth-this.params.overhangRight, this.params.overhangFront, this.params.thickness-this.params.dadoDepth]);
};

Shelf.prototype.LeftShelf1 = function(r) {
  return cube({ size: [this.params.leftShelfWidth+2*this.params.dadoDepth, this.params.innerDepth+this.params.dadoDepth, this.params.thickness], radius: r}).translate([this.params.thickness+this.params.overhangLeft-this.params.dadoDepth, this.params.overhangFront, this.params.leftShelfHeight1-this.params.thickness]);
};

Shelf.prototype.LeftShelf2 = function(r) {
  return cube({ size: [this.params.leftShelfWidth+2*this.params.dadoDepth, this.params.innerDepth+this.params.dadoDepth, this.params.thickness], radius: r }).translate([this.params.thickness+this.params.overhangLeft-this.params.dadoDepth, this.params.overhangFront, this.params.leftShelfHeight2-this.params.thickness]);
};

Shelf.prototype.RightShelf1 = function(r) {
  return cube({ size: [this.params.rightShelfWidth+2*this.params.dadoDepth, this.params.innerDepth+this.params.dadoDepth, this.params.thickness], radius: r}).translate([this.params.width-this.params.thickness-this.params.rightShelfWidth-this.params.overhangRight-this.params.dadoDepth, this.params.overhangFront, this.params.rightShelfHeight1-this.params.thickness]);
};

Shelf.prototype.RightShelf2 = function(r) {
  return cube({ size: [this.params.rightShelfWidth+2*this.params.dadoDepth, this.params.innerDepth+this.params.dadoDepth, this.params.thickness], radius: r}).translate([this.params.width-this.params.thickness-this.params.rightShelfWidth-this.params.overhangRight-this.params.dadoDepth, this.params.overhangFront, this.params.rightShelfHeight2-this.params.thickness]);
}

Shelf.prototype.Back = function(r) {
  return cube({ size: [this.params.width-this.params.overhangLeft-this.params.overhangRight, this.params.thickness, this.params.height-2*this.params.thickness+2*this.params.dadoDepth], radius: r}).translate([this.params.overhangLeft, this.params.depth-this.params.thickness-this.params.overhangBack, this.params.thickness-this.params.dadoDepth]);
}

Shelf.prototype.Bottom = function(r) {
  return cube({ size: [this.params.width-this.params.overhangLeft-this.params.overhangRight, this.params.innerDepth+this.params.thickness, this.params.thickness], radius: r}).translate([this.params.overhangLeft,this.params.overhangFront, 0]);
}

Shelf.prototype.getSolid = function() {
    var r = .03125;

    var left0 = this.Left(0);
    var right0 = this.Right(0);
    var middle0;
    var leftShelf1_0;
    var leftShelf2_0;
    var rightShelf1_0;
    var rightShelf2_0;
    var back0 = this.Back(0);
    
    var top = difference(this.Top(r), left0, right0, back0);
    var left = this.Left(r);
    var right = this.Right(r);

    var hasMiddle = !this.params.noLeftShelf && !this.params.noRightShelf;
    var middle;
    if(hasMiddle) {
      middle0 = this.Middle(0);
      top = top.subtract(middle0);
      // middle
      middle = this.Middle(r);
    }

    var back = this.Back(r);
    back = back.subtract(left0);
    back = back.subtract(right0);
    if(hasMiddle) {
      back = back.subtract(middle0);
    }

    if(!this.params.noLeftShelf) {
      // left shelf 1
      console.log("this.params.noLeftShelf1", this.params.noLeftShelf1, this.params.leftShelfHeight1);
      if(!this.params.noLeftShelf1) {
        leftShelf1_0 = this.LeftShelf1(0);
        if(hasMiddle) {
          middle = middle.subtract(leftShelf1_0);
        } else {
          right = right.subtract(leftShelf1_0);
        }
        left = left.subtract(leftShelf1_0);
        back = back.subtract(leftShelf1_0);
      }

      // left shelf 2
      console.log("this.params.noLeftShelf2", this.params.noLeftShelf2, this.params.leftShelfHeight2);
      if(!this.params.noLeftShelf2) {
        leftShelf2_0 = this.LeftShelf2(0);
        if(hasMiddle) {
          middle = middle.subtract(leftShelf2_0);
        } else {
          right = right.subtract(leftShelf2_0);
        }
        left = left.subtract(leftShelf2_0);
        back = back.subtract(leftShelf2_0);
      }
    }

    if(!this.params.noRightShelf) {
      // right shelf 1
      if(!this.params.noRightShelf1) {
        rightShelf1_0 = this.RightShelf1(0);
        if(hasMiddle) {
          middle = middle.subtract(rightShelf1_0);
        } else {
          left = left.subtract(rightShelf1_0);
        }
        right = right.subtract(rightShelf1_0);
        back = back.subtract(rightShelf1_0);
      }

      // right shelf 2
      if(!this.params.noRightShelf2) {
        rightShelf2_0 = this.RightShelf2(0);
        if(hasMiddle) {
          middle = middle.subtract(rightShelf2_0);
        } else {
          left = left.subtract(rightShelf2_0);
        }
        right = right.subtract(rightShelf2_0);
        back = back.subtract(rightShelf2_0);
      }
    }

    var bottom = difference(this.Bottom(r), left0, right0, back0);
    if(hasMiddle) {
      bottom = bottom.subtract(middle0);
    }

    var parts = [top, left, right, back, bottom];

    if(hasMiddle) {
      parts.push(middle);
    }

    if(!this.params.noLeftShelf) {
      if(!this.params.noLeftShelf1) {
        parts.push(this.LeftShelf1(r));
      }
      if(!this.params.noLeftShelf2) {
        parts.push(this.LeftShelf2(r));
      }
    }

    if(!this.params.noRightShelf) {
      if(!this.params.noRightShelf1) {
        parts.push(this.RightShelf1(r));
      }
      if(!this.params.noRightShelf2) {
        parts.push(this.RightShelf2(r));
      }
    }

    return parts;
}
