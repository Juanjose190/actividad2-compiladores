from lexer import TT, Token
from ast_nodes import (
    Program, VarDecl, Assign, IfStat, WhileStat,
    BreakStat, ContinueStat, Block,
    BinOp, IntLit, StrLit, IdExpr,
)


class ParseError(Exception):
    pass


class Parser:
    def __init__(self, tokens: list[Token]):
        self._tokens = tokens
        self._pos    = 0

    def _cur(self) -> Token:
        return self._tokens[self._pos]

    def _match(self, *types: TT) -> bool:
        return self._cur().type in types

    def _consume(self, expected: TT | None = None) -> Token:
        tok = self._tokens[self._pos]
        if expected is not None and tok.type != expected:
            raise ParseError(
                f"Se esperaba {expected.name} pero se encontró "
                f"{tok.type.name} ({tok.value!r}) en línea {tok.line}"
            )
        self._pos += 1
        return tok

    def parse(self) -> Program:
        stmts = []
        while not self._match(TT.EOF):
            stmts.append(self._stat())
        return Program(stmts)

    def _stat(self):
        tok = self._cur()
        if tok.type in (TT.INT_KW, TT.STR_KW):
            return self._var_decl()
        if tok.type == TT.IF:
            return self._if_stat()
        if tok.type == TT.WHILE:
            return self._while_stat()
        if tok.type == TT.BREAK:
            self._consume(); self._consume(TT.SEMI)
            return BreakStat(tok.line)
        if tok.type == TT.CONTINUE:
            self._consume(); self._consume(TT.SEMI)
            return ContinueStat(tok.line)
        if tok.type == TT.ID:
            return self._assign()
        raise ParseError(
            f"Token inesperado {tok.type.name} ({tok.value!r}) en línea {tok.line}"
        )

    def _var_decl(self) -> VarDecl:
        type_tok = self._consume()
        name_tok = self._consume(TT.ID)
        self._consume(TT.ASSIGN)
        expr = self._expr()
        self._consume(TT.SEMI)
        return VarDecl(type_tok.value, name_tok.value, expr, type_tok.line)

    def _assign(self) -> Assign:
        name_tok = self._consume(TT.ID)
        self._consume(TT.ASSIGN)
        expr = self._expr()
        self._consume(TT.SEMI)
        return Assign(name_tok.value, expr, name_tok.line)

    def _if_stat(self) -> IfStat:
        tok = self._consume(TT.IF)
        self._consume(TT.LPAREN)
        cond = self._expr()
        self._consume(TT.RPAREN)
        then_block = self._block()
        else_block = None
        if self._match(TT.ELSE):
            self._consume()
            else_block = self._block()
        return IfStat(cond, then_block, else_block, tok.line)

    def _while_stat(self) -> WhileStat:
        tok = self._consume(TT.WHILE)
        self._consume(TT.LPAREN)
        cond = self._expr()
        self._consume(TT.RPAREN)
        block = self._block()
        return WhileStat(cond, block, tok.line)

    def _block(self) -> Block:
        self._consume(TT.LBRACE)
        stmts = []
        while not self._match(TT.RBRACE):
            stmts.append(self._stat())
        self._consume(TT.RBRACE)
        return Block(stmts)

    def _expr(self):
        return self._compare()

    _CMP_OPS = {TT.LT, TT.GT, TT.EQ, TT.NEQ, TT.LEQ, TT.GEQ}

    def _compare(self):
        left = self._add_sub()
        while self._match(*self._CMP_OPS):
            op_tok = self._consume()
            right  = self._add_sub()
            left   = BinOp(op_tok.value, left, right, op_tok.line)
        return left

    def _add_sub(self):
        left = self._mul_div()
        while self._match(TT.PLUS, TT.MINUS):
            op_tok = self._consume()
            right  = self._mul_div()
            left   = BinOp(op_tok.value, left, right, op_tok.line)
        return left

    def _mul_div(self):
        left = self._primary()
        while self._match(TT.STAR, TT.SLASH):
            op_tok = self._consume()
            right  = self._primary()
            left   = BinOp(op_tok.value, left, right, op_tok.line)
        return left

    def _primary(self):
        tok = self._cur()
        if tok.type == TT.INT_LIT:
            self._consume()
            return IntLit(int(tok.value), tok.line)
        if tok.type == TT.STR_LIT:
            self._consume()
            return StrLit(tok.value[1:-1], tok.line)
        if tok.type == TT.ID:
            self._consume()
            return IdExpr(tok.value, tok.line)
        if tok.type == TT.LPAREN:
            self._consume()
            expr = self._expr()
            self._consume(TT.RPAREN)
            return expr
        raise ParseError(
            f"Se esperaba una expresión pero se encontró "
            f"{tok.type.name} ({tok.value!r}) en línea {tok.line}"
        )
