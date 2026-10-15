import chess

def expected_occupancy(chess_board):
    occupancy = {}

    for sq in chess.SQUARES:
        piece = chess_board.piece_at(sq)

        if piece is None:
            continue
        else:
            name = chess.square_name(sq)
            if piece.color == chess.WHITE:
                color = "W"
            else:
                color = "B"
            occupancy[name] = color
    return occupancy

def mismatch(a,b):
    squares = set(a) | set(b)
    count = 0
    for sq in squares:
        if a.get(sq) != b.get(sq):
            count += 1
    return count

def find_move(chess_board, observed):
    no_move_score = mismatch(expected_occupancy(chess_board), observed)
    best_move = None
    best_score = no_move_score
    for move in chess_board.legal_moves:
        test = chess_board.copy()
        test.push(move)
        score = mismatch(expected_occupancy(test), observed)
        if score < best_score:
            best_score = score
            best_move = move
    return best_move

     # e2e4
