from enum import Enum, auto


class TT(Enum):
    INT_KW   = auto()
    STR_KW   = auto()
    IF       = auto()
    ELSE     = auto()
    WHILE    = auto()
    BREAK    = auto()
    CONTINUE = auto()
    ID       = auto()
    INT_LIT  = auto()
    STR_LIT  = auto()
    PLUS     = auto()
    MINUS    = auto()
    STAR     = auto()
    SLASH    = auto()
    LT       = auto()
    GT       = auto()
    EQ       = auto()
    NEQ      = auto()
    LEQ      = auto()
    GEQ      = auto()
    ASSIGN   = auto()
    LPAREN   = auto()
    RPAREN   = auto()
    LBRACE   = auto()
    RBRACE   = auto()
    SEMI     = auto()
    EOF      = auto()


KEYWORDS = {
    'int':      TT.INT_KW,
    'string':   TT.STR_KW,
    'if':       TT.IF,
    'else':     TT.ELSE,
    'while':    TT.WHILE,
    'break':    TT.BREAK,
    'continue': TT.CONTINUE,
}

SINGLE = {
    '+': TT.PLUS,  '-': TT.MINUS, '*': TT.STAR,  '/': TT.SLASH,
    '<': TT.LT,    '>': TT.GT,    '=': TT.ASSIGN,
    '(': TT.LPAREN, ')': TT.RPAREN,
    '{': TT.LBRACE, '}': TT.RBRACE,
    ';': TT.SEMI,
}


class Token:
    __slots__ = ('type', 'value', 'line')

    def __init__(self, type_: TT, value: str, line: int):
        self.type  = type_
        self.value = value
        self.line  = line

    def __repr__(self):
        return f'Token({self.type.name}, {self.value!r}, L{self.line})'


class LexerError(Exception):
    pass


def tokenize(source: str) -> list[Token]:
    tokens: list[Token] = []
    pos, line = 0, 1
    n = len(source)

    while pos < n:
        ch = source[pos]

        if ch in ' \t\r':
            pos += 1
            continue
        if ch == '\n':
            line += 1
            pos += 1
            continue

        if source[pos:pos+2] == '//':
            while pos < n and source[pos] != '\n':
                pos += 1
            continue

        if ch == '"':
            start = pos
            pos += 1
            while pos < n and source[pos] != '"':
                if source[pos] == '\n':
                    raise LexerError(f'Cadena no cerrada en línea {line}')
                pos += 1
            if pos >= n:
                raise LexerError(f'Cadena no cerrada en línea {line}')
            pos += 1
            tokens.append(Token(TT.STR_LIT, source[start:pos], line))
            continue

        if ch.isdigit():
            start = pos
            while pos < n and source[pos].isdigit():
                pos += 1
            tokens.append(Token(TT.INT_LIT, source[start:pos], line))
            continue

        if ch.isalpha() or ch == '_':
            start = pos
            while pos < n and (source[pos].isalnum() or source[pos] == '_'):
                pos += 1
            word = source[start:pos]
            tokens.append(Token(KEYWORDS.get(word, TT.ID), word, line))
            continue

        two = source[pos:pos+2]
        if two == '==':
            tokens.append(Token(TT.EQ,  '==', line)); pos += 2; continue
        if two == '!=':
            tokens.append(Token(TT.NEQ, '!=', line)); pos += 2; continue
        if two == '<=':
            tokens.append(Token(TT.LEQ, '<=', line)); pos += 2; continue
        if two == '>=':
            tokens.append(Token(TT.GEQ, '>=', line)); pos += 2; continue

        if ch in SINGLE:
            tokens.append(Token(SINGLE[ch], ch, line))
            pos += 1
            continue

        raise LexerError(f"Carácter desconocido '{ch}' en línea {line}")

    tokens.append(Token(TT.EOF, '', line))
    return tokens
