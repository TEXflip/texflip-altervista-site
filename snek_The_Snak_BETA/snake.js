

function Snake(RGB,startX,startY,StartDir){
    this.first = new SnakePiece(startX, startY, RIGHT);
    this.tail = null;
    this.dir = StartDir;
    this.speed = 7, this.speedIncr = 1/8;
    this.Npieces = 1;
    this.NextX, this.NextY, this.IsGonnaEat = false;
    this.color = RGB;
    this.snake_piece = []; this.snake_head = []; this.snake_gnam = []; this.snake_tail = [];
	this.snake_dl; this.snake_dr; this.snake_ld; this.snake_lu; this.snake_rd; this.snake_ru; this.snake_ul; this.snake_ur;
	this.UpKey = 38, this.DownKey = 40, this.RightKey = 39, this.LeftKey = 37;
    
    this.update = function () {
            this.disegna();
        if (frameCount % parseInt(fr / this.speed) == 0)
            this.muovi();
	}
	
    this.disegna = function () {
        this.NextX = this.first.x + (this.dir == DIR.RIGHT ? dim : (this.dir == DIR.LEFT ? -dim : 0));
        this.NextY = this.first.y + (this.dir == DIR.DOWN ? dim : (this.dir == DIR.UP ? -dim : 0));
        var i = this.first;
        do {

            if (Dist2(this.NextX, this.NextY, i) < 1 || Dist2(this.NextX, this.NextY, food) < 1)
				this.IsGonnaEat = true;
            if (i != this.first)
                if (i == this.tail)
                    image(this.snake_tail[i.before.dir], i.x, i.y, dim, dim);
                else
                {
					var picture = null;
					if(i.before.dir == i.dir)
						picture = this.snake_piece[i.dir];
					else switch (i.next.WhereIs(i))
						{
							case DIR.DOWN:
								picture = i.before.dir == DIR.LEFT ? this.snake_dl : this.snake_dr;
								break;
							case DIR.LEFT:
								picture = i.before.dir == DIR.DOWN ? this.snake_ld : this.snake_lu;
								break;
							case DIR.RIGHT:
								picture = i.before.dir == DIR.DOWN ? this.snake_rd : this.snake_ru;
								break;
							case DIR.UP:
								picture = i.before.dir == DIR.LEFT ? this.snake_ul : this.snake_ur;
								break;
							default:
								this.snake_piece[i.dir];
						}
					image(picture, i.x, i.y, dim, dim);
				}
                
			
            i = i.next;
        } while (i != null);

        if(this.IsGonnaEat)
			image(this.snake_gnam[this.dir], this.first.x, this.first.y, dim, dim);
		else
			image(this.snake_head[this.dir], this.first.x, this.first.y, dim, dim);
        this.IsGonnaEat = false;
    }

    this.muovi = function () {
        if (this.tail != null) {
            var i = this.tail;
            do {
                if (i != this.first && i != this.first.next && Dist(i, this.first) < 1) 
					End();
                i.x = i.before.x;
                i.y = i.before.y;
                i.dir = i.before.dir;
                i = i.before;
            } while (i.before != null);
        }
        switch (this.dir)
		{
			case DIR.UP:
				this.first.dir = DIR.UP;
				this.first.y -= dim;
				break;
			case DIR.DOWN:
				this.first.dir = DIR.DOWN;
				this.first.y += dim;
				break;
			case DIR.RIGHT:
				this.first.dir = DIR.RIGHT;
				this.first.x += dim;
				break;
			case DIR.LEFT:
				this.first.dir = DIR.LEFT;
				this.first.x -= dim;
				break;
		}
        this.first.x = (this.first.x + Xwin) % Xwin;
        this.first.y = (this.first.y + Ywin) % Ywin;
    }

	this.eat = function (pos) {
	    var d = Dist(this.first, pos);
	    if (d < 1) {
	        pos.newPos();
	        this.Npieces++;
	        if (this.speed + 1 <= fr)
	            this.speed += this.speedIncr;
	        if (this.tail == null) {
	            this.tail = new SnakePiece(this.first.x, this.first.y, this.first.dir);
	            this.tail.before = this.first;
	            this.first.next = this.tail;
	        }
	        else {
	            var NewPiece = new SnakePiece(this.tail.x, this.tail.y, this.tail.dir);
	            this.tail.next = NewPiece;
	            NewPiece.before = this.tail;
	            this.tail = NewPiece;
	        }
	    }
	}
	this.createAssets = function() {//creating colored snake
		for (var i = 0; i < 4; i++)
		{
			this.snake_head[i] = CreateColor(this.color);
			this.snake_head[i].mask(snake_head_mask[i]);
			this.snake_piece[i] = CreateColor(this.color);
			this.snake_piece[i].mask(snake_piece_mask[i]);
			this.snake_gnam[i] = CreateColor(this.color);
			this.snake_gnam[i].mask(snake_gnam_mask[i]);
			this.snake_tail[i] = CreateColor(this.color);
			this.snake_tail[i].mask(snake_tail_mask[i]);
		}
		this.snake_dl = CreateColor(this.color);
		this.snake_dl.mask(snake_dl_mask);
		this.snake_dr = CreateColor(this.color);
		this.snake_dr.mask(snake_dr_mask);
		this.snake_ld = CreateColor(this.color);
		this.snake_ld.mask(snake_ld_mask);
		this.snake_lu = CreateColor(this.color);
		this.snake_lu.mask(snake_lu_mask);
		this.snake_rd = CreateColor(this.color);
		this.snake_rd.mask(snake_rd_mask);
		this.snake_ru = CreateColor(this.color);
		this.snake_ru.mask(snake_ru_mask);
		this.snake_ul = CreateColor(this.color);
		this.snake_ul.mask(snake_ul_mask);
		this.snake_ur = CreateColor(this.color);
		this.snake_ur.mask(snake_ur_mask);
	}
	this.setKeys = function(up,down,right,left){
		this.UpKey = up;
		this.DownKey = down;
		this.RightKey = right;
		this.LeftKey = left;
	}
	this.createAssets();
}

function SnakePiece(x,y,direzione){
	this.x = x;
	this.y = y;
	this.next = null;
	this.before = null;
	this.dir = direzione;
	
	this.WhereIs = function(piece){
		if(abs(this.y - (piece.y + dim)) < 1)
			return DIR.UP;
		else if(abs(this.y - (piece.y - dim)) < 1)
			return DIR.DOWN;
		else if(abs(this.x - (piece.x + dim)) < 1)
			return DIR.LEFT;
		else if(abs(this.x - (piece.x - dim)) < 1)
			return DIR.RIGHT;
		else
			return DIR.RIGHT;
	}
}

function Food() {
    this.x = dim * parseInt(random(0, Xwin) / dim);
    this.y = dim * parseInt(random(0, Ywin) / dim);

    this.update = function () {
        image(apple, this.x, this.y, dim, dim);
    }

    this.newPos = function () {
        this.x = dim * parseInt(random(0, Xwin) / dim);
        this.y = dim * parseInt(random(0, Ywin) / dim);
    }
}

function Dist(one, two) {
    return (pow((one.x - two.x), 2) + pow((one.y - two.y), 2));
}

function Dist2(x_,y_, two) {
    return (pow((x_ - two.x), 2) + pow((y_ - two.y), 2));
}

function CreateColor(RGBa) {
    out = createImage(20, 20);
    out.loadPixels();
    for (i = 0; i < out.width; i++) {
        for (j = 0; j < out.height; j++) {
            out.set(i, j, RGBa);
        }
    }
    out.updatePixels();
    
    return out;
}

function backColor(){
	return color(178,217,4);
}
function backColorHex(){
	return "#b2d904";
}
