grammar WhileLang;

// ── Regla inicial ─────────────────────────────────────────────────────────────
program : stat* EOF ;

// ── Sentencias ────────────────────────────────────────────────────────────────
stat
    : INT    ID '=' expr ';'                    # IntDecl
    | STRING ID '=' expr ';'                    # StringDecl
    | ID     '=' expr ';'                       # Assign
    | IF '(' expr ')' block (ELSE block)?       # IfStat
    | WHILE '(' expr ')' block                  # WhileStat
    | BREAK ';'                                 # BreakStat
    | CONTINUE ';'                              # ContinueStat
    ;

block : '{' stat* '}' ;

// ── Expresiones (precedencia ascendente) ──────────────────────────────────────
expr
    : expr op=('*'|'/')                    expr # MulDiv
    | expr op=('+'|'-')                    expr # AddSub
    | expr op=('<'|'>'|'=='|'<='|'>='|'!=') expr # Compare
    | INT_LIT                                   # IntLiteral
    | STRING_LIT                                # StringLiteral
    | ID                                        # IdExpr
    | '(' expr ')'                              # ParenExpr
    ;

// ── Palabras clave ────────────────────────────────────────────────────────────
INT      : 'int' ;
STRING   : 'string' ;
IF       : 'if' ;
ELSE     : 'else' ;
WHILE    : 'while' ;
BREAK    : 'break' ;
CONTINUE : 'continue' ;

// ── Terminales ────────────────────────────────────────────────────────────────
ID         : [a-zA-Z_][a-zA-Z0-9_]* ;
INT_LIT    : [0-9]+ ;
STRING_LIT : '"' (~["\r\n])* '"' ;

WS      : [ \t\r\n]+ -> skip ;
COMMENT : '//' ~[\r\n]* -> skip ;
