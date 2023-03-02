class Engine {
    constructor(canvas) {
        // Engine Loop
        this.frame = null;
        this.showTangents = false;
        this.showCircle = false;
        this.mirror = false;

        // Settings
        this.speed = 1;
        
        // Rendering Context
        this.ctx = canvas.getContext('2d');
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('fullscreenchange', () => this.resizeCanvas());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.showTangents = !this.showTangents
            } else if (e.button === 1) {
                this.showCircle = !this.showCircle;
            }
        });
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.mirror = !this.mirror;
        });

        this.radius = 100;
        this.cx = () => Math.floor(this.ctx.canvas.width / 2 + 100 - 200 * +this.mirror);
        this.cy = () => Math.floor(this.ctx.canvas.height / 2);
        this.mx = 0;
        this.my = 0;

        this.resizeCanvas();
    }

    resizeCanvas() {
        this.ctx.canvas.width = document.body.clientWidth;
        this.ctx.canvas.height = document.body.clientHeight;
    }

    onMouseMove(e) {
        if (!this.showTangents) {
            return;
        }
        this.mx = e.clientX;
        this.my = e.clientY;
    }

    drawCircle() {
        if (!this.showCircle) {
            return;
        }
        this.ctx.beginPath();
        this.ctx.arc(this.cx(), this.cy(), this.radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();
    }

    drawComponents() {
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.rect(this.cx() - this.radius - 15 + +this.mirror * 200, this.cy() - 15, 30, 30);
        this.ctx.fillStyle = 'green';
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.rect(this.cx() - this.radius - 50 + +this.mirror * 200, this.cy() + 30, 100, 50);
        this.ctx.fillStyle = 'orange';
        this.ctx.fill();
    }

    getTangents() {
        const dx = this.cx() - this.mx;
        const dy = this.cy() - this.my;
        const dd = Math.sqrt(dx * dx + dy * dy);
        const a = Math.asin(this.radius / dd);
        const b = Math.atan2(dy, dx);
        
        const ta = { x: this.radius * Math.sin(b - a), y: this.radius * -Math.cos(b - a) };
        const tb = { x: this.radius * -Math.sin(b + a), y: this.radius * Math.cos(b + a) };
        return [ta, tb];
    }

    drawTangents() {
        if (!this.mx) {
            return;
        }
        const tangents = this.getTangents();
        tangents.forEach(tangent => {
            this.ctx.beginPath();
            this.ctx.moveTo(this.mx, this.my);
            this.ctx.lineTo(this.cx() + tangent.x, this.cy() + tangent.y);
            this.ctx.strokeStyle = 'black';
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.beginPath();
            this.ctx.rect(this.cx() + tangent.x - 3, this.cy() + tangent.y - 3, 6, 6);
            this.ctx.fillStyle = 'red';
            this.ctx.fill();
        });
    }

    update(delta) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.drawComponents();
        this.drawCircle();
        this.drawTangents();
    }

    // --------------------------
    // Game Loop
    // --------------------------------

    async start() {
        if (this.frame !== null)
            return;
        
        this.last;
        this.current = performance.now();

        const loop = (timestamp) => {
            this.frame = requestAnimationFrame(loop);
    
            this.last = this.current;
            this.current = timestamp;
    
            this.update(Math.min(this.current - this.last, 100));
        }

        this.frame = requestAnimationFrame(loop);
    }

    async stop() {
        cancelAnimationFrame(this.frame);
        this.frame = null;
    }
}