var game = new Chess();
var board1 = null;
var statusElement = document.getElementById("status");
var fenElement = document.getElementById("fen");
var pgnElement = document.getElementById("pgn");
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";

function removeGreySquares() {
  $("#board1 .square-55d63").css("background", "");
}

function greySquare(square) {
  var $square = $("#board1 .square-" + square);
  var background = whiteSquareGrey;

  if ($square.hasClass("black-3c85d")) {
    background = blackSquareGrey;
  }

  $square.css("background", background);
}

function onDragStart(source, piece) {
  if (game.game_over()) return false;
  if (
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

function onDrop(source, target) {
  removeGreySquares();

  var move = game.move({
    from: source,
    to: target,
    promotion: "q",
  });
  if (move === null) return "snapback";
  updateStatus();
}

function onSnapEnd() {
  board1.position(game.fen());
}

function onMouseoverSquare(square, piece) {
  var moves = game.moves({
    square: square,
    verbose: true,
  });

  if (moves.length === 0) return;

  greySquare(square);

  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
}

function onMouseoutSquare() {
  removeGreySquares();
}

function updateStatus() {
  var status = "";
  var moveColor = game.turn() === "b" ? "Black" : "White";
  if (game.in_checkmate()) {
    status = "Game over, " + moveColor + " is in checkmate.";
  } else if (game.in_draw()) {
    status = "Game over, drawn position";
  } else {
    status = moveColor + " to move";
    if (game.in_check()) status += ", " + moveColor + " is in check";
  }
  statusElement.innerHTML = status;
  fenElement.innerHTML = game.fen();
  pgnElement.innerHTML = game.pgn();
  
  // If we're running inside the React iframe, notify the parent window.
  var bridge =
    (window.parent && window.parent.updateReactState) || window.updateReactState;
  if (bridge) {
    var turn = game.turn();
    var checkColor = game.in_check() ? (turn === "w" ? "White" : "Black") : null;
    var checkmateColor = game.in_checkmate()
      ? (turn === "w" ? "White" : "Black")
      : null;
    bridge(game.pgn(), game.fen(), {
      inCheck: game.in_check(),
      checkColor: checkColor,
      inCheckmate: game.in_checkmate(),
      checkmateColor: checkmateColor,
      inDraw: game.in_draw(),
    });
  }
}

var config = {
  draggable: true,
  position: "start",
  pieceTheme: "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  onMouseoverSquare: onMouseoverSquare,
  onMouseoutSquare: onMouseoutSquare,
};


board1 = ChessBoard("board1", config);

var flipOrientationBtn =
  window.parent.document.querySelector("#flipOrientationBtn");

if (flipOrientationBtn) {
  flipOrientationBtn.addEventListener("click", function () {
    board1.flip();
  });
}

var setStartBtn = 
  window.parent.document.querySelector("#setStartBtn");

if (setStartBtn) {
  setStartBtn.addEventListener("click", function () {
    game = new Chess();
    board1.start();
    updateStatus();
  });
}

var copyFenBtn = window.parent.document.querySelector("#copyFen");

if (copyFenBtn) {
  copyFenBtn.addEventListener("click", function () {
    var fen = game.fen();
    var parentNavigator = window.parent.navigator;

    if (parentNavigator.clipboard && parentNavigator.clipboard.writeText) {
      parentNavigator.clipboard.writeText(fen);
      return;
    }

    var textarea = window.parent.document.createElement("textarea");
    textarea.value = fen;
    window.parent.document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    window.parent.document.execCommand("copy");
    window.parent.document.body.removeChild(textarea);
  });
}

updateStatus();
