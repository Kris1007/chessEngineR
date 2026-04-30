var game = new Chess();
var board1 = null;
var statusElement = document.getElementById("status");
var fenElement = document.getElementById("fen");
var pgnElement = document.getElementById("pgn");
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
}
var config = {
  draggable: true,
  position: "start",
  pieceTheme: "https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
};
board1 = ChessBoard("board1", config);
updateStatus();