var cellCount = 100,
    cellWidth = 44,
    cellHeight = 40,
    cellMarginTop = 1,
    cellMarginBottom = 8,
    cellMarginLeftRight = 1,
    glyphMargin = 5,
    pixelRatio = window.devicePixelRatio || 1;

var pageSelected, font, fontScale, fontSize, fontBaseline, glyphScale, glyphSize, glyphBaseline;

function enableHighDPICanvas(canvas) {
    if (typeof canvas === 'string') {
        canvas = document.getElementById(canvas);
    }
    var pixelRatio = window.devicePixelRatio || 1;
    if (pixelRatio === 1) return;
    var oldWidth = canvas.width;
    var oldHeight = canvas.height;
    canvas.width = oldWidth * pixelRatio;
    canvas.height = oldHeight * pixelRatio;
    canvas.style.width = oldWidth + 'px';
    canvas.style.height = oldHeight + 'px';
    canvas.getContext('2d').scale(pixelRatio, pixelRatio);
}

/*function pathCommandToString(cmd , fontDimension) {
    var str =
        ((cmd.x !== undefined) ? cmd.x * (fontDimension*0.001) + ' ' + (-cmd.y * (fontDimension*0.001)) + ' ' : '') +
        ((cmd.x1 !== undefined) ? cmd.x1 * (fontDimension*0.001) + ' ' + (-cmd.y1 * (fontDimension*0.001)) + ' ' : '') +
        ((cmd.x2 !== undefined) ? cmd.x2 * (fontDimension*0.001) + ' ' + (-cmd.y2 * (fontDimension*0.001)) + ' ' : '');
    return str;
}*/

function contourToString(contour) {
    return '<pre class="contour">' + contour.map(function (point) {
        return '<span class="' + (point.onCurve ? 'on' : 'off') + 'curve">x=' + point.x + ' y=' + point.y + '</span>';
    }).join('\n') + '</pre>';
}

function formatUnicode(unicode) {
    unicode = unicode.toString(16);
    if (unicode.length > 4) {
        return ("000000" + unicode.toUpperCase()).substr(-6)
    } else {
        return ("0000" + unicode.toUpperCase()).substr(-4)
    }
}

function displayGlyphData(glyphIndex, fontDimension) {
    var glyph = font.glyphs.get(glyphIndex);
    var WordPath = '';
    if (glyph.numberOfContours > 0) {

    } else if (glyph.isComposite) {

    } else if (glyph.path) {
        var isM = false;
        for (i in glyph.path.commands) {
            if (glyph.path.commands[i].type == "M") {
                isM = true;
                WordPath = "";
            }
            else if (glyph.path.commands[i].type == "Z")
                isM = false;
            if (isM)
                WordPath += glyph.path.commands[i].x * (fontDimension*0.001) + " " + -glyph.path.commands[i].y * (fontDimension*0.001) + " ";
        }
        //WordPath += glyph.path.commands.map(pathCommandToString).join('');
    }
    return WordPath;
}

var arrowLength = 10,
    arrowAperture = 4;

function drawArrow(ctx, x1, y1, x2, y2) {
    var dx = x2 - x1,
        dy = y2 - y1,
        segmentLength = Math.sqrt(dx * dx + dy * dy),
        unitx = dx / segmentLength,
        unity = dy / segmentLength,
        basex = x2 - arrowLength * unitx,
        basey = y2 - arrowLength * unity,
        normalx = arrowAperture * unity,
        normaly = -arrowAperture * unitx;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(basex + normalx, basey + normaly);
    ctx.lineTo(basex - normalx, basey - normaly);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
}

/**
 * This function is Path.prototype.draw with an arrow
 * at the end of each contour.
 */
function drawPathWithArrows(ctx, path) {
    var i, cmd, x1, y1, x2, y2;
    var arrows = [];
    ctx.beginPath();
    for (i = 0; i < path.commands.length; i += 1) {
        cmd = path.commands[i];
        if (cmd.type === 'M') {
            if (x1 !== undefined) {
                arrows.push([ctx, x1, y1, x2, y2]);
            }
            ctx.moveTo(cmd.x, cmd.y);
        } else if (cmd.type === 'L') {
            ctx.lineTo(cmd.x, cmd.y);
            x1 = x2;
            y1 = y2;
        } else if (cmd.type === 'C') {
            ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
            x1 = cmd.x2;
            y1 = cmd.y2;
        } else if (cmd.type === 'Q') {
            ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y);
            x1 = cmd.x1;
            y1 = cmd.y1;
        } else if (cmd.type === 'Z') {
            arrows.push([ctx, x1, y1, x2, y2]);
            ctx.closePath();
        }
        x2 = cmd.x;
        y2 = cmd.y;
    }
    if (path.fill) {
        ctx.fillStyle = path.fill;
        ctx.fill();
    }
    if (path.stroke) {
        ctx.strokeStyle = path.stroke;
        ctx.lineWidth = path.strokeWidth;
        ctx.stroke();
    }
    ctx.fillStyle = '#000000';
    arrows.forEach(function (arrow) {
        drawArrow.apply(null, arrow);
    });
}

function onReadFile(e) {
    document.getElementById('font-name').innerHTML = '';
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            font = opentype.parse(e.target.result);
            showErrorMessage('');
            onFontLoaded(font);
        } catch (err) {
            showErrorMessage(err.toString());
            if (err.stack) console.log(err.stack);
            throw (err);
        }
    };
    reader.onerror = function (err) {
        showErrorMessage(err.toString());
    };

    reader.readAsArrayBuffer(file);
}