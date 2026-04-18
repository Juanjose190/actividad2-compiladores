"""Analizador semántico para WhileLang.

Implementa un visitor sobre el AST que verifica:
  - Variable declarada antes de uso
  - No redeclaración en el mismo ámbito
  - Compatibilidad de tipos en asignaciones y declaraciones
  - Condición de if/while debe ser de tipo 'int'
  - Comparaciones < > <= >= no están definidas para 'string'
  - break/continue solo dentro de un bucle while
"""
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
        """Registra la variable; retorna mensaje de error si ya existe en este ámbito."""
        if name in self._symbols:
            return (
                f"Error semántico en línea {line}: "
                f"variable '{name}' ya fue declarada en este ámbito"
            )
        self._symbols[name] = type_
        return None

    def lookup(self, name: str) -> str | None:
        """Busca el tipo de la variable en la cadena de ámbitos."""
        if name in self._symbols:
            return self._symbols[name]
        if self.parent:
            return self.parent.lookup(name)
        return None


class SemanticAnalyzer:
    def __init__(self):
        self.errors: list[str] = []
        self._loop_depth = 0     # profundidad de while anidados

    # ── entrada pública ───────────────────────────────────────────────────────

    def analyze(self, tree: Program) -> list[str]:
        self._visit(tree, SymbolTable())
        return self.errors

    # ── dispatcher ────────────────────────────────────────────────────────────

    def _visit(self, node, table: SymbolTable):
        name = type(node).__name__
        method = getattr(self, f'_visit_{name}', None)
        if method:
            return method(node, table)

    # ── visitantes ────────────────────────────────────────────────────────────

    def _visit_Program(self, node: Program, table: SymbolTable):
        for stmt in node.stmts:
            self._visit(stmt, table)

    def _visit_VarDecl(self, node: VarDecl, table: SymbolTable):
        expr_type = self._visit(node.expr, table)

        # tipo de la expresión debe coincidir con el tipo declarado
        if expr_type is not None and expr_type != node.type_:
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"no se puede asignar tipo '{expr_type}' "
                f"a variable '{node.name}' de tipo '{node.type_}'"
            )

        # registrar en tabla (puede fallar si ya existe)
        err = table.declare(node.name, node.type_, node.line)
        if err:
            self.errors.append(err)

    def _visit_Assign(self, node: Assign, table: SymbolTable):
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

    def _visit_IfStat(self, node: IfStat, table: SymbolTable):
        cond_type = self._visit(node.cond, table)
        if cond_type == 'string':
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"la condición del 'if' debe ser de tipo 'int', "
                f"se obtuvo 'string'"
            )

        self._visit_block(node.then_block, SymbolTable(parent=table))
        if node.else_block:
            self._visit_block(node.else_block, SymbolTable(parent=table))

    def _visit_WhileStat(self, node: WhileStat, table: SymbolTable):
        cond_type = self._visit(node.cond, table)
        if cond_type == 'string':
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"la condición del 'while' debe ser de tipo 'int', "
                f"se obtuvo 'string'"
            )

        self._loop_depth += 1
        self._visit_block(node.block, SymbolTable(parent=table))
        self._loop_depth -= 1

    def _visit_block(self, block: Block, table: SymbolTable):
        for stmt in block.stmts:
            self._visit(stmt, table)

    def _visit_BreakStat(self, node: BreakStat, table: SymbolTable):
        if self._loop_depth == 0:
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"'break' usado fuera de un bucle 'while'"
            )

    def _visit_ContinueStat(self, node: ContinueStat, table: SymbolTable):
        if self._loop_depth == 0:
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"'continue' usado fuera de un bucle 'while'"
            )

    # ── expresiones ───────────────────────────────────────────────────────────

    _ARITH = {'+', '-', '*', '/'}
    _CMP   = {'<', '>', '<=', '>=', '==', '!='}
    _ORD   = {'<', '>', '<=', '>='}          # no válidos entre strings

    def _visit_BinOp(self, node: BinOp, table: SymbolTable) -> str | None:
        lt = self._visit(node.left,  table)
        rt = self._visit(node.right, table)

        if node.op in self._ARITH:
            # + permite concatenación de strings
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
            # -, *, / solo para int
            if lt == 'string' or rt == 'string':
                self.errors.append(
                    f"Error semántico en línea {node.line}: "
                    f"operador '{node.op}' no válido con tipo 'string'"
                )
                return None
            return 'int'

        if node.op in self._CMP:
            # < > <= >= no están definidos para strings
            if node.op in self._ORD and (lt == 'string' or rt == 'string'):
                self.errors.append(
                    f"Error semántico en línea {node.line}: "
                    f"operador '{node.op}' no válido para tipo 'string'"
                )
            return 'int'   # toda comparación produce un valor booleano (int)

        return None

    def _visit_IntLit(self, node: IntLit, table: SymbolTable) -> str:
        return 'int'

    def _visit_StrLit(self, node: StrLit, table: SymbolTable) -> str:
        return 'string'

    def _visit_IdExpr(self, node: IdExpr, table: SymbolTable) -> str | None:
        t = table.lookup(node.name)
        if t is None:
            self.errors.append(
                f"Error semántico en línea {node.line}: "
                f"variable '{node.name}' no fue declarada"
            )
        return t
