class Node:
    pass


class Program(Node):
    def __init__(self, stmts):
        self.stmts = stmts


class VarDecl(Node):
    def __init__(self, type_, name, expr, line):
        self.type_ = type_
        self.name  = name
        self.expr  = expr
        self.line  = line


class Assign(Node):
    def __init__(self, name, expr, line):
        self.name = name
        self.expr = expr
        self.line = line


class IfStat(Node):
    def __init__(self, cond, then_block, else_block, line):
        self.cond       = cond
        self.then_block = then_block
        self.else_block = else_block
        self.line       = line


class WhileStat(Node):
    def __init__(self, cond, block, line):
        self.cond  = cond
        self.block = block
        self.line  = line


class BreakStat(Node):
    def __init__(self, line):
        self.line = line


class ContinueStat(Node):
    def __init__(self, line):
        self.line = line


class Block(Node):
    def __init__(self, stmts):
        self.stmts = stmts


class BinOp(Node):
    def __init__(self, op, left, right, line):
        self.op    = op
        self.left  = left
        self.right = right
        self.line  = line


class IntLit(Node):
    def __init__(self, value, line):
        self.value = value
        self.line  = line


class StrLit(Node):
    def __init__(self, value, line):
        self.value = value
        self.line  = line


class IdExpr(Node):
    def __init__(self, name, line):
        self.name = name
        self.line = line
