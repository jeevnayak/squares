"use strict";

var SquareType = {
    NORMAL: 0,
    RIGHT_ONLY: 1
}

class Square {
    constructor(row, col, type) {
        this.row = row;
        this.col = col;
        this.type = type;
        this.key = Square.generateKey(row, col);
        this.wasClicked = false;
        this.element = this.generateElement();
    }

    generateElement() {
        var element = $("<div class='square'></div>");

        var top = this.row * (Game.SIDE_LENGTH_PX + Game.GAP_PX);
        var left = this.col * (Game.SIDE_LENGTH_PX + Game.GAP_PX);
        element.css("top", top + "px");
        element.css("left", left + "px");

        element.css("width", Game.SIDE_LENGTH_PX + "px");
        element.css("height", Game.SIDE_LENGTH_PX + "px");

        element.data("key", this.key);

        if (this.type === SquareType.RIGHT_ONLY) {
            element.addClass("right-only");
        }

        return element;
    }

    setType(type) {
        this.type = type;
    }

    setClicked(wasClicked) {
        this.wasClicked = wasClicked;
    }

    static generateKey(row, col) {
        return row * 100 + col;
    }

    static getRowFromKey(key) {
        return Math.floor(key / 100);
    }

    static getColFromKey(key) {
        return key % 100;
    }
}

var GameMode = {
    NORMAL: 0,
    ENABLE_NEIGHBORS: 1,
    PATH_CONSTRAINED: 2
};

var MODE = GameMode.PATH_CONSTRAINED;

var Game = {
    SIDE_LENGTH_PX: 100,
    GAP_PX: 25,

    squares: null,
    lastClickedKey: null,
    mode: null,

    init: function(squares, initSquareKey, mode) {
        Game.squares = squares;
        Game.mode = mode;

        var squareElements = [];
        for (var key in Game.squares) {
            var square = Game.squares[key];
            if (Game.mode === GameMode.NORMAL || square.key === initSquareKey) {
                square.element.addClass("clickable");
            }
            squareElements.push(square.element);
        }
        $('#game-container').html(squareElements);
    },

    onSquareClicked: function(element) {
        if (!element.hasClass("clickable")) {
            return;
        }

        Game.lastClickedKey = element.data("key");
        Game.squares[Game.lastClickedKey].setClicked(true);
        Game.refreshSquareElements();
    },

    refreshSquareElements: function() {
        var lastClickedRow = Square.getRowFromKey(Game.lastClickedKey);
        var lastClickedCol = Square.getColFromKey(Game.lastClickedKey);

        for (var key in Game.squares) {
            var square = Game.squares[key];

            if (Game.mode === GameMode.NORMAL) {
                if (square.wasClicked) {
                    square.element.removeClass("clickable");
                    square.element.addClass("clicked");
                }
                continue;
            }

            var distance = Math.abs(square.row - lastClickedRow) + Math.abs(square.col - lastClickedCol);
            if (distance === 1) {
                if (!square.wasClicked) {
                    if (square.type === SquareType.RIGHT_ONLY) {
                        var squareToTheRightClicked = (lastClickedCol - square.col === 1) && (square.row === lastClickedRow);
                        if (squareToTheRightClicked) {
                            square.element.addClass("clickable");
                            square.element.removeClass("right-only");
                            square.setType(SquareType.NORMAL);
                        }
                    } else {
                        square.element.addClass("clickable");
                    }
                }
            } else {
                if (Game.mode === GameMode.PATH_CONSTRAINED) {
                    square.element.removeClass("clickable");
                }
                if (square.wasClicked) {
                    square.element.removeClass("clickable");
                    square.element.addClass("clicked");
                }
            }
        }
    }
};

function generate3By3(includeRightOnlySquares) {
    var squares = {};
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var key = Square.generateKey(i, j);
            var type = SquareType.NORMAL;
            if (includeRightOnlySquares) {
                if (Math.random() < 0.3 && key !== initSquareKey && j < 2) {
                    type = SquareType.RIGHT_ONLY;
                }
            }

            var square = new Square(i, j, type);
            squares[square.key] = square;
        }
    }
    return {
        squares: squares,
        initSquareKey: Square.generateKey(2,0)
    };
}

var B2_CONFIG = {
    coords: [[1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [1, 3]],
    initSquare: [1, 0]
};

function generateBoard(config) {
    var squares = {};
    for (var i = 0; i < config.coords.length; i++) {
        var row = config.coords[i][0];
        var col = config.coords[i][1];
        var square = new Square(row, col, SquareType.NORMAL);
        squares[square.key] = square;
    }
    return {
        squares: squares,
        initSquareKey: Square.generateKey(config.initSquare[0], config.initSquare[1])
    };
}

var BOARD_FUNC = generate3By3;

function initGame() {
    var board = BOARD_FUNC()
    Game.init(board.squares, board.initSquareKey, MODE);
}

$(function() {
    $('#game-container').on('click', '.square', function(event){
        Game.onSquareClicked($(this));
    });

    $('#normal-button').on('click', function(event){
        MODE = GameMode.NORMAL;
        initGame();
    });

    $('#enable-neighbors-button').on('click', function(event){
        MODE = GameMode.ENABLE_NEIGHBORS;
        initGame();
    });

    $('#path-constrained-button').on('click', function(event){
        MODE = GameMode.PATH_CONSTRAINED;
        initGame();
    });

    $('#b1-button').on('click', function(event){
        BOARD_FUNC = generate3By3;
        initGame();
    });

    $('#b2-button').on('click', function(event){
        BOARD_FUNC = generateBoard.bind(null, B2_CONFIG);
        initGame();
    });

    initGame();
});
