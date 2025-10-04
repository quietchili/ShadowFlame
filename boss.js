
class Boss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = TILE_SIZE*5;
        this.height = TILE_SIZE*5;
        this.alive = true;
        this.is_counted = false;
        this.dx = 1;
        this.dy = 0;
        this.is_on_ground = true;
        this.speed = 0.2;
        this.jump_height = 0.8;
        this.fireballs = [];
        this.fire_cooldown = 30;
        this.health = 20;
        this.facing = 'left';
        this.frame_index = 0;
        this.frame_timer = 0;
        this.frame_interval = 12;
        this.frame_index_y = 0;

        this.max_speed = 0.01;
    }
    update() {
        if (!this.alive) return;


        //fireball
        if (this.fire_cooldown > 0) this.fire_cooldown--;

        if (this.fire_cooldown === 0) {
            let fireball_speed_x = 0;
            if (this.dx == 1) {
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
            this.fire_cooldown = 100;
        }

        //movement
        if (player.x < this.x) {
            // this.x -= this.speed;
            this.dx -= this.max_speed;
            this.facing = 'left';
            this.frame_index_y = TILE_SIZE;
        } else if (player.x > this.x) {
            // this.x += this.speed;
            this.dx += this.max_speed;
            this.facing = 'right';
            this.frame_index_y = TILE_SIZE;
        } else {
            this.frame_index_y = 0;
        }

        this.is_on_ground = false;

        if (!this.is_on_ground) {
            this.dy += 0.02;
        }
        this.y += this.dy;


        floor_tiles.forEach(floor =>{
            if (this.y + this.height >= floor.y) {
                this.y = floor.y - this.height;
                this.dy = 0;
                this.is_on_ground = true;
            }
        })
        
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

        if (this.is_on_ground && Math.random() < 0.005) {
            this.dy = -this.jump_height;
            this.is_on_ground = false;
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

        this.y += this.dy;
        this.x += this.dx;
    }
    draw() {
        if (!this.alive) return;
        this.fireballs.forEach(fireball => {
            fireball.draw();
        });

        ctx.save();
        if (this.facing === 'left') {
            ctx.scale(-1, 1);
            ctx.drawImage(
                tile_map,
                this.frame_index * TILE_SIZE, this.frame_index_y,
                TILE_SIZE, TILE_SIZE,
                -this.x - this.width, this.y,
                this.width, this.height
            );
        } else {
            ctx.drawImage(
                tile_map,
                this.frame_index * TILE_SIZE, this.frame_index_y,
                TILE_SIZE, TILE_SIZE,
                this.x, this.y,
                this.width, this.height
            );
        }
        ctx.restore();
    }
}