import chess
import chess.engine

engine = chess.engine.SimpleEngine.popen_uci("stockfish.exe")


def evaluate(board, think_time=0.2):
    info = engine.analyse(board, chess.engine.Limit(time=think_time))
    score = info["score"]
    best = info.get("pv", [None])[0]
    return score, best


def analyze_move(board, move):
    mover = board.turn

    score_before, best = evaluate(board)

    after_board = board.copy()
    after_board.push(move)
    score_after, _ = evaluate(after_board)

    before_cp = score_before.pov(mover).score(mate_score=10000)
    after_cp = score_after.pov(mover).score(mate_score=10000)
    loss = before_cp - after_cp

    # step 4: write this
    # if loss >= 200 → rating = "blunder"
    # elif loss >= 100 → "mistake"
    # elif loss >= 50 → "inaccuracy"
    # else → "good"
    if loss >= 200:
        rating = "blunder"
    elif loss >= 100:
        rating = "mistake"
    elif loss >= 50:
        rating = "inaccuracy"
    else:
        rating = "good"

    return {
        "move": board.san(move),
        "rating": rating,
        "loss": loss,
        "best": board.san(best) if best else None,
    }


if __name__ == "__main__":
    board = chess.Board()
    for san in ["e4", "e5", "Qf3", "Bc5", "Bc4"]:
        board.push_san(san)
    print(analyze_move(board, board.parse_san("a6")))
    engine.quit()