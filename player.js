
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        this.health = 3;
        this.alive = true;
        this.input = {
            up: false,
            left: false,
            down: false,
            right: false,
            space: false
        }
        this.dx = 0;
        this.dy = 0;
        this.is_on_ground = false;
        this.max_speed = PLAYER_MAX_SPEED;
        this.jump_height = PLAYER_JUMP_HEIGHT;
        this.facing = 'right';
        this.frame_index = 0;
        this.frame_timer = 0;
        this.frame_interval = 12;
        this.current_animation = 'idle';
        this.frame_index_y = 0;
        this.fireballs = [];
        this.fire_cooldown = 0;
        this.can_fire = false;
        this.parachute_frame_index_x = 4;
        this.parachute_frame_index_y = 0;
    }
    update() {
        this.is_on_ground = false;

        floor_tiles.forEach(floor =>{
            if (
                this.y + this.height + this.dy >= floor.y &&
                this.x + this.width > floor.x &&
                this.x < floor.x + floor.width
            ) {
                this.y = floor.y - this.height;
                this.is_on_ground = true;
            }
        })

        if (!this.is_on_ground) {
            this.dy += 0.002;
        } else {
            this.dy = 0;
        }

        platforms.forEach(p => {
            if (
                this.y + this.height + this.dy >= p.y &&
                this.y + this.height <= p.y + p.height &&
                this.x + this.width > p.x &&
                this.x < p.x + p.width
            ) {
                this.y = p.y - this.height;
                this.is_on_ground = true;
                this.dy = 0;
            }
        });

        this.y += this.dy;
        this.x += this.dx;

        // if (this.x + this.width > world_width) {
        //     this.x = world_width - this.width;
        //     this.dx = 0;
        // }

        if (this.is_on_ground && this.input.up && this.dy < this.max_speed) {
            this.dy -= this.jump_height;
            this.is_on_ground = false;
        }
        if (this.input.left && this.dx > -this.max_speed) {
            this.dx -= this.max_speed;
            this.facing = 'left';
            this.current_animation = 'walking';
            this.frame_index_y = TILE_SIZE;
        }
        if (this.input.right && this.dx < this.max_speed) {
            this.dx += this.max_speed;
            this.facing = 'right';
            this.current_animation = 'walking';
            this.frame_index_y = TILE_SIZE;
        }
        if (!this.input.left && !this.input.right) {
            this.dx = 0;
            this.current_animation = 'idle';
            this.frame_index_y = 0;
        }

        if (this.fire_cooldown > 0) this.fire_cooldown--;

        if (this.can_fire && this.input.space && this.fire_cooldown === 0) {
            this.firing = true;
            let fireball_speed_x = 0;
            if (this.dx == 0) {
                if (this.facing === 'left') {
                    fireball_speed_x -= this.max_speed * 2;
                } else {
                    fireball_speed_x = this.max_speed * 2;
                }
            } else {
                fireball_speed_x = this.dx * 2;
            }

            const fireSound = new Audio('fire.mp3');
            fireSound.volume = 0.5;
            fireSound.play();

            let new_fireball = new Fireball(this.x, this.y, TILE_SIZE, TILE_SIZE, fireball_speed_x, 0);
            this.fireballs.push(new_fireball);
            this.fire_cooldown = 30;
        }

        

        this.frame_timer++;
        if (this.frame_timer >= this.frame_interval) {
            this.frame_timer = 0;
            this.frame_index++;

            if (this.frame_index >= 4) {
                this.frame_index = 0;
            }
        }

        this.fireballs.forEach(fireball => {
            fireball.update();
        });
    }
    draw() {
        this.fireballs.forEach(fireball => {
            fireball.draw();
        });

        ctx.save();
        ctx.translate(0,0);
        ctx.rotate(45*Math.PI/180);
        ctx.translate(-camera_x, -camera_y);

        ctx.drawImage(
            tile_map,
            this.parachute_frame_index_x * TILE_SIZE,
            this.parachute_frame_index_y,
            TILE_SIZE,
            TILE_SIZE,
            this.x-4,
            this.y-TILE_SIZE+5,
            this.width,
            this.height
        );
        ctx.restore();

        ctx.save();
        if (this.facing === 'left') {
            ctx.scale(-1, 1);
            ctx.drawImage(
                tile_map,
                this.frame_index * TILE_SIZE,
                this.frame_index_y,
                TILE_SIZE,
                TILE_SIZE,
                -this.x - this.width,
                this.y,
                this.width,
                this.height
            );
        } else {
            ctx.drawImage(
                tile_map,
                this.frame_index * TILE_SIZE,
                this.frame_index_y,
                TILE_SIZE,
                TILE_SIZE,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }

        ctx.restore();
    }
}