"""Punto de entrada del analizador semántico de WhileLang.

Uso:
    python main.py <archivo.wl>
    python main.py --test          # ejecuta todos los casos de prueba
"""
import sys
import os
from lexer    import tokenize, LexerError
from wl_parser import Parser, ParseError
from semantic import SemanticAnalyzer


def analyze(source: str) -> None:
    try:
        tokens   = tokenize(source)
        tree     = Parser(tokens).parse()
        errors   = SemanticAnalyzer().analyze(tree)

        if errors:
            for e in errors:
                print(e)
        else:
            print("Análisis semántico exitoso: no se encontraron errores.")

    except LexerError as e:
        print(f"Error léxico: {e}")
    except ParseError as e:
        print(f"Error sintáctico: {e}")


def run_tests():
    test_dir = os.path.join(os.path.dirname(__file__), 'tests')
    casos = sorted(
        f for f in os.listdir(test_dir) if f.endswith('.wl')
    )
    for caso in casos:
        path = os.path.join(test_dir, caso)
        print(f"\n{'='*60}")
        print(f"  {caso}")
        print('='*60)
        with open(path, encoding='utf-8') as fh:
            source = fh.read()
        print("Código de entrada:")
        print(source.rstrip())
        print("\nSalida obtenida:")
        analyze(source)


if __name__ == '__main__':
    if len(sys.argv) == 2 and sys.argv[1] == '--test':
        run_tests()
    elif len(sys.argv) == 2:
        with open(sys.argv[1], encoding='utf-8') as fh:
            analyze(fh.read())
    else:
        print("Uso: python main.py <archivo.wl>")
        print("     python main.py --test")
        sys.exit(1)
