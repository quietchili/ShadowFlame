let fire_audio = document.getElementById('fire');
document.getElementById("fire").volume = 0.5;

let impact_audio = document.getElementById('impact');
document.getElementById("impact").volume = 0.5;

let pickup_audio = document.getElementById('pickup');
document.getElementById("pickup").volume = 0.5;

let music_audio = document.getElementById('music');
document.getElementById("music").volume = 0.1;

const tilemap_image = new Image();
const WORLD_TILEMAP_SRC = "world_tiles.png"
const TILE_SIZE = 8;
const SCALE = 5;
const PLAYER_MAX_SPEED = 0.4;
const PLAYER_JUMP_HEIGHT = 1.1;
const IMAGE_SOURCE = "spritesheet.png";
const canvas = document.getElementById('my_canvas');
const ctx = canvas.getContext('2d');
const keys = {
    w: 'up',
    a: 'left',
    s: 'down',
    d: 'right',
    arrowup: 'up',
    arrowleft: 'left',
    arrowdown: 'down',
    arrowright: 'right',
    " ": 'space'
};
let animation_id;
let player;
let scaled_canvas_width;
let scaled_canvas_height;
let tile_map;
let platforms = [];
let power_up;

let camera_x = 0;
let camera_y = 0;

let floor;

let enemies = [];
let spawn_points = [];

let world_width;
let world_height;
let enemy_spawned_count = 0;
let enemies_remaining = 0;

let has_collected_power_up = false;


function update() {
    if (!player.alive) {
        return;
    }

    player.update();
    enemies.forEach(e => e.update());

    if (power_up && !power_up.collected) {
        power_up.update();
    } else if (power_up && power_up.collected) {
        power_up = null;
    }

    player.fireballs.forEach((fb, index) => {
        enemies.forEach(e => {
            if (
                e.alive &&
                fb.x < e.x + e.width &&
                fb.x + fb.width > e.x &&
                fb.y < e.y + e.height &&
                fb.y + fb.height > e.y
            ) {
                if (!e.is_counted) {
                    enemies_remaining--;
                    e.is_counted = true;
                }
                e.alive = false;
                
                const impactSound = new Audio('impact.mp3');
                impactSound.volume = 0.5;
                impactSound.play();
                player.fireballs.splice(index, 1);
            }
        });

        if (fb.life_span < 0) {
            player.fireballs.splice(index, 1);
        }
    });

    enemies.forEach(e => {
        if (
            e.alive &&
            player.x < e.x + e.width &&
            player.x + player.width > e.x &&
            player.y < e.y + e.height &&
            player.y + player.height > e.y
        ) {
            player.health--;            
            const impactSound = new Audio('impact.mp3');
            impactSound.volume = 0.5;
            impactSound.play();
            e.alive = false;
            enemies_remaining--;
            e.is_counted = true;
        }
    });

    if (player.health <= 0) {
        player.alive = false;
        cancelAnimationFrame(animation_id);
    }


    camera_x = player.x - scaled_canvas_width / 2 + player.width / 2;
    camera_y = player.y - scaled_canvas_height / 2 + player.height / 2;

    if (camera_x < 0) camera_x = 0;
    if (camera_x + scaled_canvas_width > world_width) camera_x = world_width - scaled_canvas_width;
    if (camera_y < 0) camera_y = 0;
    if (camera_y + scaled_canvas_height > world_height) camera_y = world_height - scaled_canvas_height;
}

async function loadImages(imageUrlArray){
    const promiseArray = [];
    const imageArray = [];

    for(let imageUrl of imageUrlArray){
        promiseArray.push(new Promise(resolve =>{
            const img = new Image();

            img.onload = function(){
                resolve();
            }
            img.src = imageUrl;
            imageArray.push(img);
        }));
    }

    await Promise.all(promiseArray);

    return imageArray;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-camera_x, -camera_y);

    ctx.fillStyle = "rgba(52,140,49)";
    ctx.fillRect(floor.x, floor.y, floor.width, floor.height);

    enemies.forEach(e => e.draw());

    player.draw();
    platforms.forEach(p => p.draw());

    draw_spawn_points();

    if (power_up) {
        power_up.draw();
    }

    ctx.restore();

    draw_ui();
}

function draw_spawn_points() {
    if (enemy_spawned_count < spawn_points.length) {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.1)";
        ctx.lineWidth = 0.1;
        spawn_points.forEach(point => {
            ctx.strokeRect(point.x, point.y, TILE_SIZE, TILE_SIZE);
        });
    }
}

function draw_ui() {
    if (enemies_remaining > 0 && player.health > 0) {
        ctx.font = "6px Arial";
        ctx.textAlign = "start";
        ctx.fillStyle = "white";
        ctx.fillText("Enemies Remaining: " + enemies_remaining, 0, 10);
    }

    ctx.font = "6px Arial";
    ctx.textAlign = "start";
    ctx.fillStyle = "white";
    ctx.fillText("Health: ", 0, 17);
    for (let i = 0; i < player.health; i++) {
        ctx.fillStyle = "red";
        ctx.fillRect(23 + i * 8, 13, 5, 5);
    }

    if (enemies_remaining === 0) {
        ctx.fillStyle = "white";
        ctx.font = "8px Arial";
        ctx.textAlign = "center";
        ctx.fillText("You Win!", 50, 10);
    } else if (player.health <= 0) {
        ctx.fillStyle = "white";
        ctx.font = "8px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", 50, 10);
    }
}

function start_enemy_spawning() {
    let spawn_interval = setInterval(() => {
        if (enemy_spawned_count < spawn_points.length) {
            const spawn_point = spawn_points[enemy_spawned_count];
            enemies.push(new Enemy(spawn_point.x, spawn_point.y));
            enemy_spawned_count++;
        } else {
            clearInterval(spawn_interval);
        }
    }, 500);
}

function loop() {
    update();
    draw();
    animation_id = requestAnimationFrame(loop);
}

function start() {
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    resize();

    world_width = 2000;
    world_height = scaled_canvas_height;

    player = new Player(scaled_canvas_width / 3, scaled_canvas_height - TILE_SIZE * 5);

    floor = {
        x: 0,
        y: scaled_canvas_height,
        width: world_width,
        height: TILE_SIZE
    };

    // platforms = [
    //     new Platform(
    //         scaled_canvas_width / 2,
    //         scaled_canvas_height - TILE_SIZE * 2,
    //         TILE_SIZE * 4,
    //         TILE_SIZE
    //     ),
    //     new Platform(
    //         scaled_canvas_width,
    //         scaled_canvas_height - TILE_SIZE * 3,
    //         TILE_SIZE * 4,
    //         TILE_SIZE
    //     ),
    //     //new Platform(scaled_canvas_width / 2 + TILE_SIZE * 5, scaled_canvas_height - TILE_SIZE * 4, TILE_SIZE * 3, TILE_SIZE),
    //     //new Platform(scaled_canvas_width / 2 + TILE_SIZE * 9, scaled_canvas_height - TILE_SIZE * 6, TILE_SIZE * 2, TILE_SIZE),
    //     //new Platform(scaled_canvas_width / 2 - TILE_SIZE * 5, scaled_canvas_height - TILE_SIZE * 4, TILE_SIZE * 4, TILE_SIZE),
    //     //new Platform(scaled_canvas_width / 2 - TILE_SIZE * 9, scaled_canvas_height - TILE_SIZE * 6, TILE_SIZE * 3, TILE_SIZE),
    //     //new Platform(scaled_canvas_width / 2, scaled_canvas_height - TILE_SIZE * 8, TILE_SIZE * 2, TILE_SIZE),
    //     //new Platform(scaled_canvas_width / 2 + TILE_SIZE * 15, scaled_canvas_height - TILE_SIZE * 2, TILE_SIZE * 5, TILE_SIZE),
    //     //new Platform(scaled_canvas_width / 2 + TILE_SIZE * 19, scaled_canvas_height - TILE_SIZE * 4, TILE_SIZE * 3, TILE_SIZE),
    //     //new Platform(scaled_canvas_width / 2 - TILE_SIZE * 15, scaled_canvas_height - TILE_SIZE * 2, TILE_SIZE * 5, TILE_SIZE),
    //     //new Platform(scaled_canvas_width / 2 - TILE_SIZE * 19, scaled_canvas_height - TILE_SIZE * 4, TILE_SIZE * 3, TILE_SIZE),
    //     //new Platform(scaled_canvas_width / 2 - TILE_SIZE * 15, scaled_canvas_height - TILE_SIZE * 7, TILE_SIZE * 2, TILE_SIZE)
    // ];

    const original_spawn_points = [
        {x: 50, y: floor.y - TILE_SIZE},
        {x: 100, y: floor.y - TILE_SIZE},
        {x: 200, y: floor.y - TILE_SIZE},
        // {x: platforms[6].x + TILE_SIZE, y: platforms[6].y - TILE_SIZE},
        // {x: platforms[8].x + TILE_SIZE, y: platforms[8].y - TILE_SIZE},
        // {x: platforms[0].x + TILE_SIZE, y: platforms[0].y - TILE_SIZE},
        // {x: platforms[1].x + TILE_SIZE, y: platforms[1].y - TILE_SIZE},
        // {x: platforms[4].x + TILE_SIZE, y: platforms[4].y - TILE_SIZE},
        // {x: platforms[5].x + TILE_SIZE, y: platforms[5].y - TILE_SIZE},
    ];

    spawn_points = original_spawn_points.concat(original_spawn_points, original_spawn_points);

    enemies_remaining = spawn_points.length;

    

    let tmp_imgs_url_array = [
        IMAGE_SOURCE,
        WORLD_TILEMAP_SRC,
    ]

    loadImages(tmp_imgs_url_array).then(imagesArray =>{

    });

    let image = new Image();
    image.src = IMAGE_SOURCE;
    image.onload = function() {
        tile_map = image;
        animation_id = requestAnimationFrame(loop);
    }
    
    tilemap_image.src = WORLD_TILEMAP_SRC;
    tilemap_image.onload = () =>{
        // resize();
        // tilemap_ctx.imageSmoothingEnabled = false;
        // tilemap_ctx.scale(SCALE,SCALE)
        // main_ctx.imageSmoothingEnabled = false;
        // main_ctx.scale(MAIN_SCALE,MAIN_SCALE)
        //tilemap_ctx.drawImage(tilemap_image, 0, 0);
    }

    //create world objects and put in their arrays
    for (let i = 0; i < world_data.length; i++) {
        for (let j = 0; j < world_data[i].length; j++) {
            if(world_data[i][j].is_tile == true){

                let new_platform = new Platform(tilemap_image,
                    world_data[i][j].x,//source x
                    world_data[i][j].y,//source y
                    TILE_SIZE,//source width
                    TILE_SIZE,//source height
                    (TILE_SIZE*i),//destination x
                    (TILE_SIZE*j),//destination y
                    TILE_SIZE,//destination width
                    TILE_SIZE//destination height
                );
                
                platforms.push(new_platform);
            }       
        }
    }

    // const top_most_platform = platforms.at(0);
    power_up = new PowerUp(200 + TILE_SIZE, floor.y - TILE_SIZE * 2);

}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scaled_canvas_width = canvas.width / SCALE;
    scaled_canvas_height = canvas.height / SCALE;

    ctx.scale(SCALE, SCALE);
    ctx.imageSmoothingEnabled = false;
}

document.addEventListener('keydown', (event) => {
    const dir = keys[event.key.toLocaleLowerCase()];
    if (dir) {
        player.input[dir] = true;
    }
});

document.addEventListener('keyup', (event) => {
    const dir = keys[event.key.toLocaleLowerCase()];
    if (dir) {
        player.input[dir] = false;
    }
});

start();