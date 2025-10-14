// RainEffect: A visually stunning dollar bill rain animation for web pages.
// Usage: import { startMoneyRain } and call startMoneyRain({ ...options }) to trigger the effect.

export class RainEffect {
    constructor(options = {}) {
        // Number of bills to animate; default is 150 for a rich effect.
        this.numBills = options.numBills || 150;
        // Size of each bill image in pixels.
        this.imageSize = options.imageSize || 50;
        // Source URL for the bill image; defaults to a twemoji dollar bill.
        this.imageUrl = options.imageUrl || 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f4b8.png';

        this.canvas = null; // Canvas element for rendering.
        this.ctx = null;    // 2D rendering context.
        this.bills = [];    // Array holding bill objects.
        this.animationFrame = null; // Animation frame reference.
    }

    // Initializes and starts the rain animation.
    start() {
        try {
            this.createCanvas();
            this.loadBills();
            this.animate();
        } catch (error) {
            console.error('RainEffect start error:', error);
        }
    }

    // Dynamically creates a fullscreen, non-interactive canvas.
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    }

    // Loads bill images and initializes their animation properties.
    loadBills() {
        for (let i = 0; i < this.numBills; i++) {
            const image = new Image();
            image.src = this.imageUrl;

            this.bills.push({
                image,
                x: Math.random() * this.canvas.width,           // Random horizontal start.
                y: Math.random() * -this.canvas.height,         // Start above the viewport.
                speed: 2 + Math.random() * 3,                   // Random falling speed.
                angle: Math.random() * 2 * Math.PI,             // Initial rotation.
                direction: Math.random() < 0.5 ? -0.05 : 0.05,  // Rotation direction.
                opacity: 1                                      // Fully visible initially.
            });
        }
    }

    // Main animation loop: draws and updates all bills, cleans up when done.
    animate = () => {
        this.clearCanvas();
        let allGone = true;

        this.bills.forEach(bill => {
            this.drawBill(bill);
            this.updateBill(bill);

            if (bill.y < this.canvas.height + this.imageSize) {
                allGone = false; // At least one bill still visible.
            }
        });

        if (!allGone) {
            this.animationFrame = requestAnimationFrame(this.animate);
        } else {
            this.cleanup();
        }
    }

    // Clears the canvas for the next animation frame.
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draws a single bill with rotation and opacity.
    drawBill(bill) {
        this.ctx.save();
        this.ctx.globalAlpha = bill.opacity; // Apply fade effect.
        this.ctx.translate(bill.x, bill.y);
        this.ctx.rotate(bill.angle);
        this.ctx.drawImage(bill.image, -this.imageSize / 2, -this.imageSize / 2, this.imageSize, this.imageSize);
        this.ctx.restore();
    }

    // Updates bill position, rotation, and opacity for fade-out.
    updateBill(bill) {
        bill.y += bill.speed;
        bill.angle += bill.direction;
        bill.x += Math.sin(bill.angle) * 1.5;

        // Fade out when bill reaches bottom 20% of the canvas.
        if (bill.y > this.canvas.height * 0.8) {
            bill.opacity -= 0.02;
            if (bill.opacity < 0) bill.opacity = 0;
        }
    }

    // Cleans up animation and removes canvas from DOM.
    cleanup() {
        cancelAnimationFrame(this.animationFrame);
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        this.bills = [];
    }
}

// Convenience function to start the money rain effect.
export function startMoneyRain(options = {}) {
    new RainEffect(options).start();
}
