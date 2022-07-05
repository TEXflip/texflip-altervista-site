
var dim = 20;// n*n pixel
var Xwin = dim * parseInt(window.innerWidth / dim), 
	Ywin = dim * parseInt(window.innerHeight / dim);
var snek, snek2;
var fr = 60;
var food;
var lost = true, IsPaused = false;
var AssetsDir = "assets/";
var EndPoints, EndChooseName, EndName, EndTitle, EndButton, ResumeButton;
var snake_piece_mask = [], 
	snake_head_mask = [], 
	snake_gnam_mask = [], 
	snake_tail_mask = [], 
	apple;
var snake_dl_mask, snake_dr_mask, snake_ld_mask, snake_lu_mask, snake_rd_mask, snake_ru_mask, snake_ul_mask, snake_ur_mask;
var DIR = {
  RIGHT: 0,
  UP: 1,
  LEFT: 2,
  DOWN: 3
};

function setup() {
    createCanvas(Xwin, Ywin, P2D);
	frameRate(fr);
	ElementSetup();
	background(backColor());
}

function draw() {
    if (!lost && !IsPaused) {
		background(backColor());
        snek.update();
        snek2.update();
        food.update();
        snek.eat(food);
        snek2.eat(food);
    }
}

function preload() {//Loading the masks of the snake
	//normal pieces
    snake_piece_mask[DIR.RIGHT] = loadImage(AssetsDir + "SP_right.png");
    snake_piece_mask[DIR.LEFT] = loadImage(AssetsDir + "SP_left.png");
    snake_piece_mask[DIR.UP] = loadImage(AssetsDir + "SP_up.png");
    snake_piece_mask[DIR.DOWN] = loadImage(AssetsDir + "SP_down.png");
    //head of the snake
    snake_head_mask[DIR.RIGHT] = loadImage(AssetsDir + "Head_right.png");
    snake_head_mask[DIR.LEFT] = loadImage(AssetsDir + "Head_left.png");
    snake_head_mask[DIR.UP] = loadImage(AssetsDir + "Head_up.png");
    snake_head_mask[DIR.DOWN] = loadImage(AssetsDir + "Head_down.png");
    //mask when the snake is going to eat
    snake_gnam_mask[DIR.RIGHT] = loadImage(AssetsDir + "gnam_right.png");
    snake_gnam_mask[DIR.LEFT] = loadImage(AssetsDir + "gnam_left.png");
    snake_gnam_mask[DIR.UP] = loadImage(AssetsDir + "gnam_up.png");
    snake_gnam_mask[DIR.DOWN] = loadImage(AssetsDir + "gnam_down.png");
    //tail of the snake
    snake_tail_mask[DIR.RIGHT] = loadImage(AssetsDir + "tail_right.png");
    snake_tail_mask[DIR.UP] = loadImage(AssetsDir + "tail_up.png");
    snake_tail_mask[DIR.LEFT] = loadImage(AssetsDir + "tail_left.png");
    snake_tail_mask[DIR.DOWN] = loadImage(AssetsDir + "tail_down.png");
    //pieces applyed when the snake change direction
    snake_dl_mask = loadImage(AssetsDir + "transition/down_left.png");
    snake_dr_mask = loadImage(AssetsDir + "transition/down_right.png");
    snake_ld_mask = loadImage(AssetsDir + "transition/left_down.png");
    snake_lu_mask = loadImage(AssetsDir + "transition/left_up.png");
    snake_rd_mask = loadImage(AssetsDir + "transition/right_down.png");
    snake_ru_mask = loadImage(AssetsDir + "transition/right_up.png");
    snake_ul_mask = loadImage(AssetsDir + "transition/up_left.png");
    snake_ur_mask = loadImage(AssetsDir + "transition/up_right.png");
    //loading the apple
    apple = loadImage("assets/apple.png");
}

function keyPressed() {
    if (!lost && !IsPaused) {
        switch (keyCode) {
			case snek2.UpKey: if(snek2.first.dir != DIR.DOWN) snek2.dir = DIR.UP; break;
            case snek.UpKey: if (snek.first.dir != DIR.DOWN) snek.dir = DIR.UP; break;
            case snek2.DownKey: if(snek2.first.dir != DIR.UP) snek2.dir = DIR.DOWN; break;
            case snek.DownKey: if (snek.first.dir != DIR.UP) snek.dir = DIR.DOWN; break;
            case snek2.RightKey: if(snek2.first.dir != DIR.LEFT) snek2.dir = DIR.RIGHT; break;
            case snek.RightKey: if (snek.first.dir != DIR.LEFT) snek.dir = DIR.RIGHT; break;
            case snek2.LeftKey: if(snek2.first.dir != DIR.RIGHT) snek2.dir = DIR.LEFT; break;
            case snek.LeftKey: if (snek.first.dir != DIR.RIGHT) snek.dir = DIR.LEFT; break;
            case ESCAPE: Pause(); break;
        }
    }
    else
        switch(keyCode){
            case ENTER: Start(); break;
            case ESCAPE: Pause(); break;
        }
}

function ElementSetup() {
    EndPoints = document.getElementById("Points");
    EndTitle = document.getElementById("EndTitle");
    EndButton = document.getElementById("retry");
    ResumeButton = document.getElementById("pause");
    ResumeButton.style.visibility = "hidden";
    
    EndButton.style.color = backColorHex();
    ResumeButton.style.color = backColorHex();
    EndButton.style.borderColor = backColorHex();
    ResumeButton.style.borderColor = backColorHex();
}

function Start() {
    lost = false;
    IsPaused = false;
    EndButton.style.visibility = "hidden";
    EndTitle.style.visibility = "hidden";
    EndPoints.style.visibility = "hidden";
    ResumeButton.style.visibility = "hidden";
    EndButton.value = "Retry";
    snek = new Snake(color(34,34,34),0,0,DIR.RIGHT);
    snek.setKeys(38,40,39,37);
    snek2 = new Snake(color(36,80,115),Xwin-20,Ywin-20,DIR.LEFT);
    snek2.setKeys(87,83,68,65);
    food = new Food();
}

function End() {
    EndButton.style.visibility = "visible";
    EndTitle.style.visibility = "visible";
    EndPoints.innerHTML = "Points: " + snek.Npieces;
    EndPoints.style.visibility = "visible";
    lost = true;
}

function Pause() {
    if (IsPaused && !lost) {
        EndButton.style.visibility = "hidden";
        EndTitle.style.visibility = "hidden";
        EndPoints.style.visibility = "hidden";
        ResumeButton.style.visibility = "hidden";
        IsPaused = false;
    }
    else if(!lost){
        EndButton.style.visibility = "visible";
        EndTitle.style.visibility = "visible";
        EndPoints.innerHTML = "Points: " + snek.Npieces;
        EndPoints.style.visibility = "visible";
        ResumeButton.style.visibility = "visible";
        IsPaused = true;
    }
}
