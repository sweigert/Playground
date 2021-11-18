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

const WIDTH = 500;
const HEIGHT = 500;

class Ant {
    constructor(rule) {
        this.rule = rule;
        this.direction = direction.down;
        this.x = WIDTH / 2;
        this.y = HEIGHT / 2;
        //this.x = Math.floor(Math.random() * WIDTH);
        //this.y = Math.floor(Math.random() * HEIGHT);

        this.moves = 0
        this.mutationSpeed = Math.max(5, Math.floor(Math.random() * 20));
        this.mutationAmount = Math.floor(Math.random() * Math.max(1, Math.floor(this.rule.length/10)));
    }

    move(cells) {
        this.moves++;
        var newX = this.x;
        var newY = this.y;
        this.direction = (this.direction + this.rule[cells[this.x][this.y]]) % 4
        switch (this.direction) {
            case direction.up:
                newY = (this.y + (HEIGHT - 1)) % HEIGHT;
                break;
            case direction.right:
                newX = (this.x + 1) % WIDTH;
                break;
            case direction.down:
                newY = (this.y + 1) % HEIGHT;
                break;
            case direction.left:
                newX = (this.x + (WIDTH - 1)) % WIDTH;
                break;
            default:
                console.log("Unknown direction: " + this.direction);
        }

        this.x = newX;
        this.y = newY;
        // we moved
        return true;
        /*
        if (Math.abs(cells[newX][newY] - cells[this.x][this.y]) < 2 || cells[newX][newY] == -1) {
            this.x = newX;
            this.y = newY;
            return true;
        }

        return false;*/

        /*
        if (this.moves > (this.rule.length * this.mutationSpeed)) {
            // console.log("Mutate; Speed:", this.mutationSpeed, "; Amount: ", this.mutationAmount);
            for (var i = 0; i < this.mutationAmount; i++) {
                var idx = Math.floor(Math.random() * this.rule.length);
                var newRule = [direction.left, direction.right][Math.floor(Math.random() * 2)];
                // console.log("\tMutate - idx ", idx, " from ", this.rule[idx] + " to " + newRule);
                this.rule[idx] = newRule;
            }

            this.moves = 0;
        }
        */
    }
}

// LRLRLRRR

var cells = [];
var ants = [];
var stopped = true;

function init() {
    counter = 0;
    stopped = false;
    for (var i = 0; i < HEIGHT; i++) {
        cells[i] = [];
        for (var j = 0; j < WIDTH; j++) {
            cells[i][j] = -1;
        }
    }

    addAnt(1);
}

function stop() {
    stopped = true;
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

function addAntClicked() {
    cnt = document.getElementById('antCntChooser').value;
    addAnt(cnt)
}

function addAnt(cnt) {
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

    for (i = 0; i < cnt; i++) {
        ants.push(new Ant(rule));
    }

    update();
}


needsRedraw = [];

/**
 * Check which cells are still alive.
 */
function update(cnt) {
    if (stopped) {
        return
    }

    counter += 1

    ants.forEach(function (ant, i) {
        cellState = cells[ant.x][ant.y]
        if (cellState == -1) {
            cellState = 0;
        }
        
        cells[ant.x][ant.y] = (cellState + 1) % ant.rule.length
        
        needsRedraw.push([ant.x, ant.y, (cellState + 1) % ant.rule.length])
        if (ant.move(cells)) {
            needsRedraw.push([ant.x, ant.y, cells[ant.x][ant.y]]);
        }
    });

    draw();
}

var canvas = document.getElementById('canvas').getContext('2d');
var seq = [];
var currentPal = "";
var currentStart = -1;
var currentEnd = -1;

/**
 * Draw cells on canvas
 */
function draw() {
    var selectedStart = document.getElementById('rule').selectionStart;
    var selectedEnd = document.getElementById('rule').selectionEnd;
    var selectedPal = document.getElementById('paletteChooser').value;
    
    var redraw = false;
    if (currentPal == "" || currentPal != selectedPal) {
        currentPal = selectedPal;
        if (currentPal == "grayscale") {
            seq = chroma.scale().mode('lab').domain([0,ants[0].rule.length]);    
        } else {
            seq = chroma.scale(currentPal).mode('lab').domain([0,ants[0].rule.length]);
        }
        redraw = true;
    }
    if (currentStart == -1 || currentStart != selectedStart) {
        currentStart = selectedStart;
        redraw = true;
    }
    if (currentEnd == -1 || currentEnd != selectedEnd) {
        currentEnd = selectedEnd;
        redraw = true;
    }


    if (redraw) {
        canvas.clearRect(0, 0, WIDTH, HEIGHT);
        for (x = 0; x < WIDTH; x++) {
            for (y = 0; y < HEIGHT; y++) {
                if (cells[x][y] >= currentStart && cells[x][y] <= currentEnd) {
                    canvas.fillStyle = seq(cells[x][y]).hex();
                    canvas.fillRect(x * 1, y * 1, 1, 1);                
                }
            }
        }
    }

    needsRedraw.forEach(function (coords, c) {
        x = coords[0];
        y = coords[1];
        
        //cellState = coords[2];
        //cells[x][y] = cellState;

        if (cells[x][y] >= currentStart && cells[x][y] <= currentEnd) {
            canvas.fillStyle = seq(cells[x][y]).hex();
        } else {
            canvas.fillStyle = "#000000";
        }
        canvas.fillRect(x * 1, y * 1, 1, 1);
    });
    needsRedraw = [];

    setTimeout(function () { update(); }, 0);
}