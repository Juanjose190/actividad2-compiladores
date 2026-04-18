from ast_nodes import (
    Program, VarDecl, Assign, IfStat, WhileStat,
    BreakStat, ContinueStat, Block,
    BinOp, IntLit, StrLit, IdExpr,
)


class SymbolTable:
    def __init__(self, parent=None):
        self._symbols: dict[str, str] = {}
        self.parent = parent

    def declare(self, name: str, type_: str, line: int) -> str | None:
        if name in self._symbols:
            return (
                f"Error semántico en línea {line}: "
                f"variable '{name}' ya fue declarada en este ámbito"
            )
        self._symbols[name] = type_
        return None

    def lookup(self, name: str) -> str | None:
        if name in self._symbols:
            return self._symbols[name]
        if self.parent:
            return self.parent.lookup(name)
        return None


class SemanticAnalyzer:
    def __init__(self):
        self.errors: list[str] = []
        self._loop_depth = 0

    def analyze(self, tree: Program) -> list[str]:
        self._visit(tree, SymbolTable())
        return self.errors

    def _visit(self, node, table: SymbolTable):
        method = getattr(self, f'_visit_{type(node).__name__}', None)
        if method:
            return method(node, table)

    def _visit_Program(self, node, table):
        for stmt in node.stmts:
            self._visit(stmt, table)

    def _visit_VarDecl(self, node, table):
        expr_type = self._visit(node.expr, table)
        if expr_type is not None and expr_type != node.type_:
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"no se puede asignar tipo '{expr_type}' "
                f"a variable '{node.name}' de tipo '{node.type_}'"
            )
        err = table.declare(node.name, node.type_, node.line)
        if err:
            self.errors.append(err)

    def _visit_Assign(self, node, table):
        var_type = table.lookup(node.name)
        if var_type is None:
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"variable '{node.name}' no fue declarada"
            )
            return
        expr_type = self._visit(node.expr, table)
        if expr_type is not None and expr_type != var_type:
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"no se puede asignar tipo '{expr_type}' "
                f"a variable '{node.name}' de tipo '{var_type}'"
            )

    def _visit_IfStat(self, node, table):
        cond_type = self._visit(node.cond, table)
        if cond_type == 'string':
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"la condición del 'if' debe ser de tipo 'int', se obtuvo 'string'"
            )
        self._visit_block(node.then_block, SymbolTable(parent=table))
        if node.else_block:
            self._visit_block(node.else_block, SymbolTable(parent=table))

    def _visit_WhileStat(self, node, table):
        cond_type = self._visit(node.cond, table)
        if cond_type == 'string':
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"la condición del 'while' debe ser de tipo 'int', se obtuvo 'string'"
            )
        self._loop_depth += 1
        self._visit_block(node.block, SymbolTable(parent=table))
        self._loop_depth -= 1

    def _visit_block(self, block, table):
        for stmt in block.stmts:
            self._visit(stmt, table)

    def _visit_BreakStat(self, node, table):
        if self._loop_depth == 0:
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"'break' usado fuera de un bucle 'while'"
            )

    def _visit_ContinueStat(self, node, table):
        if self._loop_depth == 0:
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"'continue' usado fuera de un bucle 'while'"
            )

    _ARITH = {'+', '-', '*', '/'}
    _CMP   = {'<', '>', '<=', '>=', '==', '!='}
    _ORD   = {'<', '>', '<=', '>='}

    def _visit_BinOp(self, node, table):
        lt = self._visit(node.left,  table)
        rt = self._visit(node.right, table)

        if node.op in self._ARITH:
            if node.op == '+':
                if lt == 'string' and rt == 'string':
                    return 'string'
                if lt == 'int' and rt == 'int':
                    return 'int'
                if lt is not None and rt is not None:
                    self.errors.append(
                        f"Error semántico en línea {node.line}: "
                        f"operador '+' no válido entre tipos '{lt}' y '{rt}'"
                    )
                    return None
                return lt or rt
            if lt == 'string' or rt == 'string':
                self.errors.append(
                    f"Error semántico en línea {node.line}: "
                    f"operador '{node.op}' no válido con tipo 'string'"
                )
                return None
            return 'int'

        if node.op in self._CMP:
            if node.op in self._ORD and (lt == 'string' or rt == 'string'):
                self.errors.append(
                    f"Error semántico en línea {node.line}: "
                    f"operador '{node.op}' no válido para tipo 'string'"
                )
            return 'int'

        return None

    def _visit_IntLit(self, node, table): return 'int'
    def _visit_StrLit(self, node, table): return 'string'

    def _visit_IdExpr(self, node, table):
        t = table.lookup(node.name)
        if t is None:
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"variable '{node.name}' no fue declarada"
            )
        return t
