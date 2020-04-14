/**
 * Conway's Game of Life.
 *
 * A simple Javascript implementation by ankr.
 *
 * @author http://ankr.dk
 */

const direction = {
    up: 0,
    right: 1,
    down: 2,
    left: 3
};

const WIDTH = 800;
const HEIGHT = 800;

class Ant {
    constructor(rule) {
        this.rule = rule;
        this.direction = direction.down;
        this.x = WIDTH / 2;
        this.y = HEIGHT / 2;
        //this.x = Math.floor(Math.random() * WIDTH);
        //this.y = Math.floor(Math.random() * HEIGHT);
    }

    move() {
        switch (this.direction) {
            case direction.up:
                this.y = (this.y + (HEIGHT - 1)) % HEIGHT;
                break;
            case direction.right:
                this.x = (this.x + 1) % WIDTH;
                break;
            case direction.down:
                this.y = (this.y + 1) % HEIGHT;
                break;
            case direction.left:
                this.x = (this.x + (WIDTH - 1)) % WIDTH;
                break;
            default:
                alert("Unknown direction: " + this.direction);
        }
    }
}

var cells = [];
var ants = [];

function init() {
    for (var i = 0; i < HEIGHT; i++) {
        cells[i] = [];
        for (var j = 0; j < WIDTH; j++) {
            cells[i][j] = 0;
        }
    }

    addAnt();
}

function genRule() {
    ruleStr = "";
    ruleLength = document.getElementById('ruleLength').value;
    for (i = 0; i < ruleLength; i++) {
        if (Math.random() > 0.5) {
            ruleStr += 'L';
        } else {
            ruleStr += 'R';
        }
    }
    document.getElementById('rule').value = ruleStr;

    return ruleStr;
}


function addAnt() {
    ruleStr = document.getElementById('rule').value;
    if (ruleStr == "") {
        ruleStr = genRule();
    }
    document.getElementById('rule').value = ruleStr;
    rule = [];
    for (var i = 0; i < ruleStr.length; i++) {
        switch (ruleStr.charAt(i)) {
            case 'L':
                rule.push(direction.left);
                break;
            case 'R':
                rule.push(direction.right);
                break;
            default:
                alert("Unknown character \'" + ruleStr.charAt(i) + "\' in rule: \'" + ruleStr + "\'")
        }
    }

    ants.push(new Ant(rule));

    update();
}


needsUpdate = [];
iterations = 0;

/**
 * Check which cells are still alive.
 */
function update(cnt) {
    ants.forEach(function (ant, i) {
        cellState = cells[ant.x][ant.y]
        ant.direction = (ant.direction + ant.rule[cellState]) % 4
        cells[ant.x][ant.y] = (cellState + 1) % ant.rule.length
        needsUpdate.push([ant.x, ant.y])

        ant.move()
        needsUpdate.push([ant.x, ant.y])
    });

    draw();
}

var canvas = document.getElementById('gol').getContext('2d');
var seq = [];
/**
 * Draw cells on canvas
 */
function draw() {
    if (seq.length == 0) {
        seq = palette('sequential', ants[0].rule.length);
    }
    needsUpdate.forEach(function (coords, c) {
        x = coords[0];
        y = coords[1];
        canvas.fillStyle = "#" + seq[cells[x][y]];
        canvas.fillRect(x * 1, y * 1, 1, 1);
    });
    needsUpdate = [];

    setTimeout(function () { update(); }, 0);
}