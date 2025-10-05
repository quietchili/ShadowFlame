
class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        this.collected = false;

        this.frame_index = 0;
        this.frame_timer = 0;
        this.frame_interval = 12;
        this.y_offset = 0;
        this.float_speed = 0.02;
        this.max_float = 2;
        this.float_dir = 1;
    }

    update() {
        if (this.collected) return;

        this.y_offset += this.float_speed * this.float_dir;
        if (this.y_offset > this.max_float || this.y_offset < -this.max_float) {
            this.float_dir *= -1;
        }

        this.frame_timer++;
        if (this.frame_timer >= this.frame_interval) {
            this.frame_timer = 0;
            this.frame_index++;
            if (this.frame_index >= 4) {
                this.frame_index = 0;
            }
        }

        if (
            player.x < this.x + this.width &&
            player.x + player.width > this.x &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        ) {
            this.collected = true;
            player.can_fire = true;
            has_collected_power_up = true;
            pickup_audio.play();
            //music_audio.play()
            start_enemy_spawning();
            console.log("Power-up collected! You can now fire!");
        }
    }

    draw() {
        if (this.collected) return;

        ctx.drawImage(
            tile_map,
            this.frame_index * TILE_SIZE,
            4 * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE,
            this.x,
            this.y + this.y_offset,
            this.width,
            this.height
        );
    }
}