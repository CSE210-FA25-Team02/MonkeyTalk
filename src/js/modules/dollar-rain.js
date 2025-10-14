export class RainEffect {
  constructor(options = {}) {
    this.numBills = options.numBills || 150;
    this.imageSize = options.imageSize || 50;
    this.imageUrl = options.imageUrl || 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f4b8.png';

    this.canvas = null;
    this.ctx = null;
    this.bills = [];
    this.animationFrame = null;
  }

  start() {
    try {
      this.createCanvas();
      this.loadBills();
      this.animate();
    } catch (error) {
      console.error('RainEffect start error:', error);
    }
  }

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

  loadBills() {
    for (let i = 0; i < this.numBills; i++) {
      const image = new Image();
      image.src = this.imageUrl;

      this.bills.push({
        image,
        x: Math.random() * this.canvas.width,
        y: Math.random() * -this.canvas.height,
        speed: 2 + Math.random() * 3,
        angle: Math.random() * 2 * Math.PI,
        direction: Math.random() < 0.5 ? -0.05 : 0.05,
        opacity: 1
      });
    }
  }

  animate = () => {
    this.clearCanvas();
    let allGone = true;

    this.bills.forEach(bill => {
      this.drawBill(bill);
      this.updateBill(bill);

      if (bill.y < this.canvas.height + this.imageSize) {
        allGone = false; // still some bills on screen
      }
    });

    if (!allGone) {
      this.animationFrame = requestAnimationFrame(this.animate);
    } else {
      this.cleanup();
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBill(bill) {
    this.ctx.save();
    this.ctx.globalAlpha = bill.opacity; // use opacity for fade
    this.ctx.translate(bill.x, bill.y);
    this.ctx.rotate(bill.angle);
    this.ctx.drawImage(bill.image, -this.imageSize / 2, -this.imageSize / 2, this.imageSize, this.imageSize);
    this.ctx.restore();
  }

  updateBill(bill) {
    bill.y += bill.speed;
    bill.angle += bill.direction;
    bill.x += Math.sin(bill.angle) * 1.5;

    // Start fading once it reaches bottom 20% of canvas
    if (bill.y > this.canvas.height * 0.8) {
      bill.opacity -= 0.02; // slowly fade
      if (bill.opacity < 0) bill.opacity = 0;
    }
  }

  cleanup() {
    cancelAnimationFrame(this.animationFrame);
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.bills = [];
  }
}

export function startMoneyRain(options = {}) {
  new RainEffect(options).start();
}
