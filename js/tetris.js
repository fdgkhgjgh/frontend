// tetris.js - Full Tetris Game

let tetrisOpen = false;
let tetrisGame = null;

function toggleTetris() {
    const modal = document.getElementById('tetris-modal');
    tetrisOpen = !tetrisOpen;

    if (tetrisOpen) {
        modal.style.display = 'flex';
        if (!tetrisGame) {
            tetrisGame = new TetrisGame();
        } else {
            tetrisGame.resume();
        }
    } else {
        modal.style.display = 'none';
        if (tetrisGame) tetrisGame.pause();
    }
}

class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetris-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('tetris-next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');

        this.COLS = 10;
        this.ROWS = 20;
        this.BLOCK = this.canvas.width / this.COLS;

        this.COLORS = [
            null,
            '#00f0f0', // I - cyan
            '#0000f0', // J - blue
            '#f0a000', // L - orange
            '#f0f000', // O - yellow
            '#00f000', // S - green
            '#a000f0', // T - purple
            '#f00000'  // Z - red
        ];

        this.SHAPES = [
            null,
            [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
            [[2,0,0],[2,2,2],[0,0,0]],                   // J
            [[0,0,3],[3,3,3],[0,0,0]],                   // L
            [[4,4],[4,4]],                               // O
            [[0,5,5],[5,5,0],[0,0,0]],                   // S
            [[0,6,0],[6,6,6],[0,0,0]],                   // T
            [[7,7,0],[0,7,7],[0,0,0]]                    // Z
        ];

        this.board = this.createBoard();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.animId = null;
        this.dropCounter = 0;
        this.dropInterval = 800;
        this.lastTime = 0;

        this.currentPiece = this.newPiece();
        this.nextPiece = this.newPiece();

        this.bindControls();
        this.bindTouch();
        this.update();
    }

    createBoard() {
        return Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
    }

    newPiece() {
        const type = Math.floor(Math.random() * 7) + 1;
        const shape = this.SHAPES[type].map(row => [...row]);
        return {
            type,
            shape,
            x: Math.floor(this.COLS / 2) - Math.floor(shape[0].length / 2),
            y: 0
        };
    }

    isValid(piece, offsetX = 0, offsetY = 0, shape = null) {
        const s = shape || piece.shape;
        for (let r = 0; r < s.length; r++) {
            for (let c = 0; c < s[r].length; c++) {
                if (!s[r][c]) continue;
                const newX = piece.x + c + offsetX;
                const newY = piece.y + r + offsetY;
                if (newX < 0 || newX >= this.COLS || newY >= this.ROWS) return false;
                if (newY >= 0 && this.board[newY][newX]) return false;
            }
        }
        return true;
    }

    rotate(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                rotated[c][rows - 1 - r] = shape[r][c];
            }
        }
        return rotated;
    }

    lock() {
        this.currentPiece.shape.forEach((row, r) => {
            row.forEach((val, c) => {
                if (!val) return;
                const y = this.currentPiece.y + r;
                const x = this.currentPiece.x + c;
                if (y < 0) {
                    this.gameOver = true;
                    return;
                }
                this.board[y][x] = this.currentPiece.type;
            });
        });

        if (this.gameOver) {
            this.showGameOver();
            return;
        }

        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.newPiece();

        if (!this.isValid(this.currentPiece)) {
            this.gameOver = true;
            this.showGameOver();
        }
    }

    clearLines() {
        let cleared = 0;
        for (let r = this.ROWS - 1; r >= 0; r--) {
            if (this.board[r].every(v => v !== 0)) {
                this.board.splice(r, 1);
                this.board.unshift(Array(this.COLS).fill(0));
                cleared++;
                r++;
            }
        }
        if (cleared > 0) {
            const points = [0, 100, 300, 500, 800];
            this.score += (points[cleared] || 800) * this.level;
            this.lines += cleared;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 800 - (this.level - 1) * 70);
            document.getElementById('tetris-score').textContent = this.score;
            document.getElementById('tetris-lines').textContent = this.lines;
            document.getElementById('tetris-level').textContent = this.level;
        }
    }

    getGhostY() {
        let ghostY = 0;
        while (this.isValid(this.currentPiece, 0, ghostY + 1)) ghostY++;
        return this.currentPiece.y + ghostY;
    }

    draw() {
        const B = this.BLOCK;
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid
        this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        this.ctx.lineWidth = 0.5;
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                this.ctx.strokeRect(c * B, r * B, B, B);
            }
        }

        // Board
        this.board.forEach((row, r) => {
            row.forEach((val, c) => {
                if (!val) return;
                this.drawBlock(this.ctx, c, r, this.COLORS[val]);
            });
        });

        // Ghost piece
        const ghostY = this.getGhostY();
        this.currentPiece.shape.forEach((row, r) => {
            row.forEach((val, c) => {
                if (!val) return;
                this.ctx.fillStyle = 'rgba(255,255,255,0.15)';
                this.ctx.fillRect(
                    (this.currentPiece.x + c) * B + 1,
                    (ghostY + r) * B + 1,
                    B - 2, B - 2
                );
            });
        });

        // Current piece
        this.currentPiece.shape.forEach((row, r) => {
            row.forEach((val, c) => {
                if (!val) return;
                this.drawBlock(
                    this.ctx,
                    this.currentPiece.x + c,
                    this.currentPiece.y + r,
                    this.COLORS[this.currentPiece.type]
                );
            });
        });

        // Next piece
        const NB = this.nextCanvas.width / 4;
        this.nextCtx.fillStyle = '#1a1a2e';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        const ns = this.nextPiece.shape;
        const offsetX = Math.floor((4 - ns[0].length) / 2);
        const offsetY = Math.floor((4 - ns.length) / 2);
        ns.forEach((row, r) => {
            row.forEach((val, c) => {
                if (!val) return;
                this.drawBlock(this.nextCtx, offsetX + c, offsetY + r, this.COLORS[this.nextPiece.type], NB);
            });
        });
    }

    drawBlock(ctx, x, y, color, size = this.BLOCK) {
        ctx.fillStyle = color;
        ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(x * size + 1, y * size + 1, size - 2, 3);
        ctx.fillRect(x * size + 1, y * size + 1, 3, size - 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x * size + 1, y * size + size - 4, size - 2, 3);
    }

    update(time = 0) {
        if (this.gameOver || this.paused) return;
        const delta = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += delta;
        if (this.dropCounter >= this.dropInterval) {
            this.moveDown();
            this.dropCounter = 0;
        }
        this.draw();
        this.animId = requestAnimationFrame(t => this.update(t));
    }

    moveDown() {
        if (this.isValid(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        } else {
            this.lock();
        }
    }

    moveLeft() {
        if (this.isValid(this.currentPiece, -1, 0)) this.currentPiece.x--;
    }

    moveRight() {
        if (this.isValid(this.currentPiece, 1, 0)) this.currentPiece.x++;
    }

    rotatePiece() {
        const rotated = this.rotate(this.currentPiece.shape);
        if (this.isValid(this.currentPiece, 0, 0, rotated)) {
            this.currentPiece.shape = rotated;
        } else if (this.isValid(this.currentPiece, 1, 0, rotated)) {
            this.currentPiece.x++;
            this.currentPiece.shape = rotated;
        } else if (this.isValid(this.currentPiece, -1, 0, rotated)) {
            this.currentPiece.x--;
            this.currentPiece.shape = rotated;
        }
    }

    hardDrop() {
        while (this.isValid(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            this.score += 2;
        }
        this.lock();
        this.dropCounter = 0;
        document.getElementById('tetris-score').textContent = this.score;
    }

    pause() {
        this.paused = true;
        if (this.animId) cancelAnimationFrame(this.animId);
    }

    resume() {
        if (this.gameOver) return;
        this.paused = false;
        this.lastTime = 0;
        this.update();
    }

    restart() {
        if (this.animId) cancelAnimationFrame(this.animId);
        this.board = this.createBoard();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.dropCounter = 0;
        this.dropInterval = 800;
        this.lastTime = 0;
        this.currentPiece = this.newPiece();
        this.nextPiece = this.newPiece();
        document.getElementById('tetris-score').textContent = '0';
        document.getElementById('tetris-lines').textContent = '0';
        document.getElementById('tetris-level').textContent = '1';
        document.getElementById('tetris-gameover').style.display = 'none';
        this.update();
    }

    showGameOver() {
        if (this.animId) cancelAnimationFrame(this.animId);
        document.getElementById('tetris-gameover').style.display = 'flex';
        document.getElementById('tetris-final-score').textContent = this.score;
    }

    bindControls() {
        document.addEventListener('keydown', (e) => {
            if (!tetrisOpen || this.gameOver || this.paused) return;
            switch (e.key) {
                case 'ArrowLeft': this.moveLeft(); break;
                case 'ArrowRight': this.moveRight(); break;
                case 'ArrowDown': this.moveDown(); this.dropCounter = 0; break;
                case 'ArrowUp': this.rotatePiece(); break;
                case ' ': this.hardDrop(); break;
                case 'p': case 'P': this.togglePause(); break;
            }
        });
    }

    togglePause() {
        if (this.paused) {
            this.resume();
            document.getElementById('tetris-pause-btn').textContent = '暂停';
        } else {
            this.pause();
            document.getElementById('tetris-pause-btn').textContent = '继续';
        }
    }

    bindTouch() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            if (!tetrisOpen || this.gameOver || this.paused) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            const dt = Date.now() - touchStartTime;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (dt < 200 && absDx < 10 && absDy < 10) {
                // Tap = rotate
                this.rotatePiece();
            } else if (absDx > absDy) {
                // Horizontal swipe
                if (dx > 20) this.moveRight();
                else if (dx < -20) this.moveLeft();
            } else {
                // Vertical swipe
                if (dy > 20) {
                    if (dy > 60) this.hardDrop();
                    else this.moveDown();
                }
            }
            e.preventDefault();
        }, { passive: false });
    }
}

window.toggleTetris = toggleTetris;
window.tetrisRestart = () => { if (tetrisGame) tetrisGame.restart(); };
window.tetrisTogglePause = () => { if (tetrisGame) tetrisGame.togglePause(); };
