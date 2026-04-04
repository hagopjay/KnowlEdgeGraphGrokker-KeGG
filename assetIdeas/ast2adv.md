# Advanced AST Masterclass: Deep Python Metaprogramming

## 1. AST Compilation Pipeline Internals

Understanding Python's compilation phases unlocks powerful optimization opportunities:

```python
import ast
import compile
import dis
import marshal
import types

class CompilationPipeline:
    """Understand and control Python's compilation process"""
    
    def __init__(self, code):
        self.source = code
        self.tokens = None
        self.ast = None
        self.bytecode = None
        self.code_object = None
    
    def tokenize(self):
        """Phase 1: Tokenization"""
        import tokenize
        import io
        
        tokens = []
        tokens_iter = tokenize.generate_tokens(io.StringIO(self.source).readline)
        
        for token in tokens_iter:
            tokens.append(token)
        
        self.tokens = tokens
        return tokens
    
    def parse(self):
        """Phase 2: AST Generation"""
        self.ast = ast.parse(self.source)
        return self.ast
    
    def compile_to_bytecode(self):
        """Phase 3: Bytecode Generation"""
        self.code_object = compile(self.ast, '<pipeline>', 'exec')
        self.bytecode = self.code_object.co_code
        return self.bytecode
    
    def optimize_ast(self):
        """Custom optimization pass"""
        class AdvancedOptimizer(ast.NodeTransformer):
            def visit_If(self, node):
                # Constant folding for if statements
                if isinstance(node.test, ast.Constant):
                    if node.test.value:
                        return node.body
                    else:
                        return node.orelse or []
                
                # Dead code elimination
                if isinstance(node.test, ast.UnaryOp) and isinstance(node.test.op, ast.Not):
                    if isinstance(node.test.operand, ast.Constant) and not node.test.operand.value:
                        return node.body
                
                return self.generic_visit(node)
            
            def visit_BinOp(self, node):
                """Advanced constant folding"""
                self.generic_visit(node)
                
                if isinstance(node.left, ast.Constant) and isinstance(node.right, ast.Constant):
                    ops = {
                        ast.Add: lambda x, y: x + y,
                        ast.Sub: lambda x, y: x - y,
                        ast.Mult: lambda x, y: x * y,
                        ast.Div: lambda x, y: x / y if y != 0 else None,
                        ast.Mod: lambda x, y: x % y if y != 0 else None,
                        ast.Pow: lambda x, y: x ** y,
                        ast.LShift: lambda x, y: x << y,
                        ast.RShift: lambda x, y: x >> y,
                        ast.BitOr: lambda x, y: x | y,
                        ast.BitXor: lambda x, y: x ^ y,
                        ast.BitAnd: lambda x, y: x & y,
                    }
                    
                    if type(node.op) in ops:
                        try:
                            result = ops[type(node.op)](node.left.value, node.right.value)
                            if result is not None:
                                return ast.Constant(value=result)
                        except:
                            pass
                
                return node
        
        optimizer = AdvancedOptimizer()
        self.ast = optimizer.visit(self.ast)
        ast.fix_missing_locations(self.ast)
        return self.ast
    
    def serialize_ast(self):
        """Serialize AST for caching"""
        return marshal.dumps(compile(self.ast, '<serialized>', 'exec'))
    
    def full_pipeline(self):
        """Complete compilation with optimization"""
        self.tokenize()
        self.parse()
        self.optimize_ast()
        self.compile_to_bytecode()
        return self.code_object

# Example usage
code = """
def inefficient_function():
    if True:
        x = 2 + 3 * 4
        if not False:
            return x
    else:
        return 0
"""

pipeline = CompilationPipeline(code)
optimized_code = pipeline.full_pipeline()

print("Original bytecode:")
dis.dis(compile(code, '<original>', 'exec'))

print("\nOptimized bytecode:")
dis.dis(optimized_code)
```

## 2. Advanced AST Pattern Matching and Rewriting

Beyond simple node visiting, implement sophisticated pattern matching:

```python
class ASTPattern:
    """Sophisticated AST pattern matching system"""
    
    def __init__(self, pattern_str):
        self.pattern = ast.parse(pattern_str, mode='eval').body
        self.wildcards = {}
    
    def match(self, node):
        """Match AST node against pattern with wildcards"""
        return self._match_recursive(node, self.pattern)
    
    def _match_recursive(self, node, pattern):
        # Handle wildcards (nodes starting with $_)
        if isinstance(pattern, ast.Name) and pattern.id.startswith('$_'):
            wildcard_name = pattern.id[2:]  # Remove $_
            if wildcard_name in self.wildcards:
                return self._nodes_equal(node, self.wildcards[wildcard_name])
            else:
                self.wildcards[wildcard_name] = node
                return True
        
        # Type check
        if type(node) != type(pattern):
            return False
        
        # Match all fields
        for field, value in ast.iter_fields(pattern):
            if not hasattr(node, field):
                return False
            
            node_value = getattr(node, field)
            
            if isinstance(value, list):
                if not isinstance(node_value, list) or len(node_value) != len(value):
                    return False
                
                for nv, pv in zip(node_value, value):
                    if not self._match_recursive(nv, pv):
                        return False
            elif isinstance(value, ast.AST):
                if not self._match_recursive(node_value, value):
                    return False
            else:
                if node_value != value:
                    return False
        
        return True
    
    def _nodes_equal(self, node1, node2):
        """Deep equality check for AST nodes"""
        if type(node1) != type(node2):
            return False
        
        for field, value in ast.iter_fields(node1):
            node2_value = getattr(node2, field)
            
            if isinstance(value, list):
                if not isinstance(node2_value, list) or len(value) != len(node2_value):
                    return False
                for v1, v2 in zip(value, node2_value):
                    if isinstance(v1, ast.AST):
                        if not self._nodes_equal(v1, v2):
                            return False
                    elif v1 != v2:
                        return False
            elif isinstance(value, ast.AST):
                if not self._nodes_equal(value, node2_value):
                    return False
            else:
                if value != node2_value:
                    return False
        
        return True

class ASTRewriter:
    """Advanced AST rewriting with patterns"""
    
    def __init__(self):
        self.rules = []
    
    def add_rule(self, pattern, replacement):
        """Add rewrite rule: pattern -> replacement"""
        self.rules.append((ASTPattern(pattern), replacement))
    
    def rewrite(self, tree):
        """Apply all rewrite rules to tree"""
        class RewriteTransformer(ast.NodeTransformer):
            def visit(self, node):
                for pattern, replacement in self.rules:
                    pattern.wildcards = {}  # Reset wildcards
                    if pattern.match(node):
                        # Apply replacement with wildcards
                        return self._apply_replacement(replacement, pattern.wildcards)
                
                return self.generic_visit(node)
            
            def _apply_replacement(self, replacement, wildcards):
                """Apply replacement template with wildcard substitution"""
                if isinstance(replacement, str):
                    # Parse replacement as AST
                    replacement_ast = ast.parse(replacement, mode='eval').body
                    return self._substitute_wildcards(replacement_ast, wildcards)
                else:
                    return replacement
            
            def _substitute_wildcards(self, node, wildcards):
                """Substitute wildcards in replacement AST"""
                if isinstance(node, ast.Name) and node.id.startswith('$_'):
                    wildcard_name = node.id[2:]
                    if wildcard_name in wildcards:
                        return wildcards[wildcard_name]
                
                # Recursively substitute in all fields
                for field, value in ast.iter_fields(node):
                    if isinstance(value, list):
                        new_list = []
                        for item in value:
                            if isinstance(item, ast.AST):
                                new_list.append(self._substitute_wildcards(item, wildcards))
                            else:
                                new_list.append(item)
                        setattr(node, field, new_list)
                    elif isinstance(value, ast.AST):
                        setattr(node, field, self._substitute_wildcards(value, wildcards))
                
                return node
        
        transformer = RewriteTransformer()
        return transformer.visit(tree)

# Example: Optimize list comprehensions
rewriter = ASTRewriter()
rewriter.add_rule(
    "[x for x in $_iter if $_cond]",
    "filter($_cond, $_iter)"
)

code = """
result = [x for x in numbers if x > 0]
filtered = [item for item in data if item.active]
"""

tree = ast.parse(code)
optimized = rewriter.rewrite(tree)
print(ast.unparse(optimized))
```

## 3. Control Flow Graph Analysis

Build sophisticated control flow analysis:

```python
class ControlFlowGraph:
    """Build and analyze control flow graphs from AST"""
    
    def __init__(self):
        self.nodes = {}
        self.edges = []
        self.entry_node = None
        self.exit_nodes = []
    
    def build_from_ast(self, ast_node):
        """Build CFG from AST"""
        self.entry_node = self._process_node(ast_node)
        return self
    
    def _process_node(self, node):
        """Process AST node into CFG nodes"""
        if isinstance(node, ast.Module):
            return self._process_sequence(node.body)
        
        elif isinstance(node, ast.FunctionDef):
            return self._process_sequence(node.body)
        
        elif isinstance(node, ast.If):
            return self._process_if(node)
        
        elif isinstance(node, ast.For):
            return self._process_for(node)
        
        elif isinstance(node, ast.While):
            return self._process_while(node)
        
        elif isinstance(node, ast.Return):
            cfg_node = CFGNode(node, 'return')
            self.exit_nodes.append(cfg_node)
            return cfg_node
        
        else:
            return CFGNode(node, 'statement')
    
    def _process_sequence(self, statements):
        """Process sequence of statements"""
        if not statements:
            return None
        
        first_node = self._process_node(statements[0])
        current = first_node
        
        for stmt in statements[1:]:
            next_node = self._process_node(stmt)
            if current and next_node:
                self.edges.append((current, next_node))
                current = next_node
        
        return first_node
    
    def _process_if(self, node):
        """Process if statement"""
        test_node = CFGNode(node.test, 'test')
        
        # True branch
        true_branch = self._process_sequence(node.body)
        if true_branch:
            self.edges.append((test_node, true_branch))
        
        # False branch
        if node.orelse:
            false_branch = self._process_sequence(node.orelse)
            if false_branch:
                self.edges.append((test_node, false_branch))
        
        return test_node
    
    def _process_for(self, node):
        """Process for loop"""
        loop_node = CFGNode(node, 'loop')
        body_node = self._process_sequence(node.body)
        
        if body_node:
            self.edges.append((loop_node, body_node))
            # Back edge for loop
            self.edges.append((body_node, loop_node))
        
        return loop_node
    
    def _process_while(self, node):
        """Process while loop"""
        return self._process_for(node)  # Similar structure
    
    def find_dominators(self):
        """Find dominator nodes in CFG"""
        # Implementation of dominator algorithm
        pass
    
    def find_loops(self):
        """Detect natural loops in CFG"""
        loops = []
        
        # Find back edges (edges that go to already visited nodes)
        for source, target in self.edges:
            if self._dominates(target, source):
                loops.append(self._find_loop_body(source, target))
        
        return loops
    
    def _dominates(self, a, b):
        """Check if node a dominates node b"""
        # Simplified dominance check
        return True  # Placeholder
    
    def _find_loop_body(self, back_edge_source, back_edge_target):
        """Find all nodes in loop body"""
        # Implementation of loop body detection
        pass

class CFGNode:
    """Node in control flow graph"""
    
    def __init__(self, ast_node, node_type):
        self.ast_node = ast_node
        self.type = node_type
        self.id = id(self)
    
    def __repr__(self):
        return f"CFGNode({self.type}, {self.id})"

# Usage
code = """
def complex_function(x):
    if x > 0:
        for i in range(x):
            if i % 2 == 0:
                print(i)
            else:
                continue
    else:
        return -1
    return 0
"""

tree = ast.parse(code)
cfg = ControlFlowGraph()
cfg.build_from_ast(tree.body[0])  # Process function
```

## 4. Advanced Type System Integration

Leverage typing for sophisticated analysis:

```python
import typing
from typing import get_type_hints, get_origin, get_args
import inspect

class TypeInferenceEngine:
    """Advanced type inference for AST nodes"""
    
    def __init__(self):
        self.type_cache = {}
        self.constraints = []
    
    def infer_types(self, tree, context=None):
        """Infer types for all nodes in AST"""
        context = context or {}
        
        class TypeInferrer(ast.NodeVisitor):
            def __init__(self, engine):
                self.engine = engine
                self.current_scope = context.copy()
            
            def visit_FunctionDef(self, node):
                # Get type hints
                if hasattr(node, 'type_comment') and node.type_comment:
                    # Handle type comments
                    pass
                
                # Infer from annotations
                for arg in node.args.args:
                    if arg.annotation:
                        arg_type = self.engine._eval_type_annotation(arg.annotation)
                        self.current_scope[arg.arg] = arg_type
                
                # Visit body with updated scope
                for stmt in node.body:
                    self.visit(stmt)
            
            def visit_Assign(self, node):
                # Infer type from value
                if isinstance(node.value, ast.Constant):
                    value_type = type(node.value.value)
                elif isinstance(node.value, ast.List):
                    element_types = [self.engine._infer_expression_type(elt, self.current_scope) 
                                   for elt in node.value.elts]
                    if element_types and all(t == element_types[0] for t in element_types):
                        value_type = list[element_types[0]]
                    else:
                        value_type = list
                else:
                    value_type = self.engine._infer_expression_type(node.value, self.current_scope)
                
                # Update scope for targets
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        self.current_scope[target.id] = value_type
        
        inferrer = TypeInferrer(self)
        inferrer.visit(tree)
        return inferrer.current_scope
    
    def _eval_type_annotation(self, annotation):
        """Evaluate type annotation AST node"""
        if isinstance(annotation, ast.Name):
            return eval(annotation.id, {'int': int, 'str': str, 'list': list, 'dict': dict})
        elif isinstance(annotation, ast.Subscript):
            # Handle generic types like List[int]
            return self._eval_type_annotation(annotation.value)
        else:
            return object
    
    def _infer_expression_type(self, expr, scope):
        """Infer type of expression"""
        if isinstance(expr, ast.Constant):
            return type(expr.value)
        elif isinstance(expr, ast.Name):
            return scope.get(expr.id, object)
        elif isinstance(expr, ast.BinOp):
            left_type = self._infer_expression_type(expr.left, scope)
            right_type = self._infer_expression_type(expr.right, scope)
            
            # Type inference rules for binary operations
            if isinstance(expr.op, ast.Add):
                if left_type == str or right_type == str:
                    return str
                elif left_type == int and right_type == int:
                    return int
                elif left_type == float or right_type == float:
                    return float
        
        return object

class TypeChecker:
    """Advanced type checking with constraints"""
    
    def __init__(self):
        self.errors = []
        self.type_engine = TypeInferenceEngine()
    
    def check_types(self, tree, type_hints=None):
        """Check types in AST with optional type hints"""
        inferred_types = self.type_engine.infer_types(tree, type_hints or {})
        
        class TypeCheckVisitor(ast.NodeVisitor):
            def __init__(self, checker):
                self.checker = checker
                self.types = inferred_types
            
            def visit_Call(self, node):
                # Check function call types
                if isinstance(node.func, ast.Name):
                    func_name = node.func.id
                    if func_name in self.types:
                        expected_type = self.types[func_name]
                        # Check argument types
                        self._check_call_arguments(node, expected_type)
                
                self.generic_visit(node)
            
            def _check_call_arguments(self, call_node, func_type):
                """Check function call arguments match signature"""
                # Implementation of argument type checking
                pass
        
        visitor = TypeCheckVisitor(self)
        visitor.visit(tree)
        return self.errors

# Usage
code = """
def process_data(items: list[int]) -> int:
    total = 0
    for item in items:
        total += item  # Type: int + int -> int
    return total
"""

checker = TypeChecker()
tree = ast.parse(code)
errors = checker.check_types(tree)
```

## 5. Advanced Debugging and Introspection

Build sophisticated debugging tools:

```python
class ASTDebugger:
    """Advanced AST debugging and introspection"""
    
    def __init__(self):
        self.breakpoints = {}
        self.watchpoints = {}
        self.trace_data = []
    
    def set_breakpoint(self, line_number, condition=None):
        """Set conditional breakpoint"""
        self.breakpoints[line_number] = condition
    
    def set_watchpoint(self, variable, condition=None):
        """Watch variable changes"""
        self.watchpoints[variable] = condition
    
    def inject_debug_hooks(self, tree):
        """Inject debugging hooks into AST"""
        class DebugInjector(ast.NodeTransformer):
            def visit_FunctionDef(self, node):
                # Add debugging prologue
                debug_prologue = ast.parse('''
import sys
def debug_hook(frame, event, arg):
    if event == 'line':
        print(f"Line {frame.f_lineno}: {frame.f_code.co_name}")
    return debug_hook
sys.settrace(debug_hook)
''').body
                
                node.body = debug_prologue + node.body
                return node
            
            def visit_Assign(self, node):
                # Add watchpoint checks
                if isinstance(node.targets[0], ast.Name):
                    var_name = node.targets[0].id
                    if var_name in self.watchpoints:
                        watch_code = f'''
if "{var_name}" in locals():
    old_value = {var_name}
else:
    old_value = None
'''
                        post_assign = f'''
new_value = {var_name}
if old_value != new_value:
    print(f"Variable {var_name} changed: {{old_value}} -> {{new_value}}")
'''
                        
                        pre_node = ast.parse(watch_code).body[0]
                        post_node = ast.parse(post_assign).body[0]
                        
                        return [pre_node, node, post_node]
                
                return node
        
        injector = DebugInjector()
        return injector.visit(tree)
    
    def trace_execution(self, tree):
        """Add execution tracing"""
        class TracingTransformer(ast.NodeTransformer):
            def visit_FunctionDef(self, node):
                # Wrap function with tracing
                original_name = node.name
                node.name = f"_original_{original_name}"
                
                wrapper_code = f'''
def {original_name}(*args, **kwargs):
    print(f"Entering {original_name} with args={{args}}, kwargs={{kwargs}}")
    try:
        result = _original_{original_name}(*args, **kwargs)
        print(f"Exiting {original_name} with result={{result}}")
        return result
    except Exception as e:
        print(f"Exception in {original_name}: {{e}}")
        raise
'''
                
                wrapper_tree = ast.parse(wrapper_code)
                return [node] + wrapper_tree.body
        
        transformer = TracingTransformer()
        return transformer.visit(tree)

# Usage
debugger = ASTDebugger()
debugger.set_watchpoint('x')
debugger.set_breakpoint(10, 'x > 5')

code = """
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
"""

tree = ast.parse(code)
debug_tree = debugger.inject_debug_hooks(tree)
traced_tree = debugger.trace_execution(debug_tree)
```

## 6. Domain-Specific Language Creation

Build DSLs with AST transformation:

```python
class DSLCompiler:
    """Compile domain-specific language to Python"""
    
    def __init__(self):
        self.macros = {}
        self.operators = {}
    
    def define_macro(self, name, pattern, expansion):
        """Define a macro transformation"""
        self.macros[name] = (pattern, expansion)
    
    def define_operator(self, symbol, precedence, associativity, implementation):
        """Define custom operator"""
        self.operators[symbol] = {
            'precedence': precedence,
            'associativity': associativity,
            'implementation': implementation
        }
    
    def compile_dsl(self, dsl_code):
        """Compile DSL to Python AST"""
        # Parse DSL syntax (simplified)
        python_equivalent = self._translate_dsl(dsl_code)
        tree = ast.parse(python_equivalent)
        return self._expand_macros(tree)
    
    def _translate_dsl(self, dsl_code):
        """Translate DSL syntax to Python"""
        # Simple translation rules
        translations = {
            'WHERE': 'if',
            'FOREACH': 'for',
            'IN': 'in',
            'RETURN': 'return',
            'DEFINE': 'def',
            '->': ':',
            'AND': 'and',
            'OR': 'or',
        }
        
        result = dsl_code
        for dsl_token, python_token in translations.items():
            result = result.replace(dsl_token, python_token)
        
        return result
    
    def _expand_macros(self, tree):
        """Expand macros in AST"""
        class MacroExpander(ast.NodeTransformer):
            def visit_Call(self, node):
                if isinstance(node.func, ast.Name) and node.func.id in self.macros:
                    pattern, expansion = self.macros[node.func.id]
                    return self._expand_macro(node, pattern, expansion)
                return self.generic_visit(node)
        
        expander = MacroExpander()
        return expander.visit(tree)
    
    def _expand_macro(self, call_node, pattern, expansion):
        """Expand individual macro"""
        # Macro expansion logic
        return ast.parse(expansion).body[0]

# Example DSL: Query Language
dsl_compiler = DSLCompiler()

# Define macros
dsl_compiler.define_macro('SELECT', 
    'SELECT fields FROM collection WHERE condition',
    '[item for item in collection if condition]'
)

dsl_code = """
DEFINE process_users(users) ->
    filtered = SELECT u.name FROM users WHERE u.age > 18
    FOREACH user IN filtered:
        RETURN user.upper()
"""

compiled = dsl_compiler.compile_dsl(dsl_code)
```

## 7. Memory-Safe AST Transformations

Handle large codebases efficiently:

```python
import weakref
import gc

class MemoryEfficientTransformer:
    """Memory-efficient AST transformation for large codebases"""
    
    def __init__(self):
        self.node_cache = weakref.WeakKeyDictionary()
        self.transformation_stats = {}
    
    def transform_large_tree(self, tree, chunk_size=1000):
        """Transform large AST in chunks"""
        chunks = self._chunk_ast(tree, chunk_size)
        
        for i, chunk in enumerate(chunks):
            print(f"Processing chunk {i+1}/{len(chunks)}")
            
            # Transform chunk
            transformed_chunk = self._transform_chunk(chunk)
            
            # Update original tree
            self._update_tree_chunk(tree, chunk, transformed_chunk)
            
            # Force garbage collection
            gc.collect()
        
        return tree
    
    def _chunk_ast(self, tree, chunk_size):
        """Split AST into manageable chunks"""
        chunks = []
        current_chunk = []
        
        for node in ast.walk(tree):
            current_chunk.append(node)
            if len(current_chunk) >= chunk_size:
                chunks.append(current_chunk)
                current_chunk = []
        
        if current_chunk:
            chunks.append(current_chunk)
        
        return chunks
    
    def _transform_chunk(self, chunk):
        """Transform a chunk of AST nodes"""
        # Apply transformations with caching
        transformed = []
        
        for node in chunk:
            if node in self.node_cache:
                transformed.append(self.node_cache[node])
            else:
                transformed_node = self._transform_node(node)
                self.node_cache[node] = transformed_node
                transformed.append(transformed_node)
        
        return transformed
    
    def _transform_node(self, node):
        """Transform individual node"""
        # Implement specific transformations
        return node
    
    def _update_tree_chunk(self, tree, original_chunk, transformed_chunk):
        """Update original tree with transformed chunk"""
        # Update tree structure
        pass

class StreamingASTProcessor:
    """Process AST nodes as a stream"""
    
    def __init__(self):
        self.processors = []
    
    def add_processor(self, processor):
        """Add a node processor"""
        self.processors.append(processor)
    
    def process_stream(self, tree):
        """Process AST as a stream of nodes"""
        for node in ast.walk(tree):
            for processor in self.processors:
                processor.process_node(node)
                
                # Yield control to allow other operations
                yield node

# Usage for large codebases
class OptimizationProcessor:
    def process_node(self, node):
        if isinstance(node, ast.FunctionDef):
            # Optimize function
            pass

processor = StreamingASTProcessor()
processor.add_processor(OptimizationProcessor())

# Process large codebase
large_tree = ast.parse(open('large_file.py').read())
for processed_node in processor.process_stream(large_tree):
    # Handle processed node
    pass
```

## 8. AST-Based Security Analysis

Advanced security analysis techniques:

```python
class SecurityAnalyzer:
    """Advanced security analysis using AST"""
    
    def __init__(self):
        self.vulnerabilities = []
        self.security_rules = {}
        self.taint_tracking = {}
    
    def add_security_rule(self, rule_name, pattern, severity):
        """Add security rule"""
        self.security_rules[rule_name] = {
            'pattern': pattern,
            'severity': severity
        }
    
    def analyze_security(self, tree):
        """Comprehensive security analysis"""
        # Taint analysis
        self._perform_taint_analysis(tree)
        
        # Pattern matching for vulnerabilities
        self._find_vulnerability_patterns(tree)
        
        # Data flow analysis
        self._analyze_data_flow(tree)
        
        return self.vulnerabilities
    
    def _perform_taint_analysis(self, tree):
        """Track tainted data flow"""
        class TaintTracker(ast.NodeVisitor):
            def __init__(self, analyzer):
                self.analyzer = analyzer
                self.tainted_vars = set()
                self.sources = {'input', 'raw_input', 'request.form', 'request.args'}
                self.sinks = {'eval', 'exec', 'compile', 'open', 'os.system'}
            
            def visit_Call(self, node):
                func_name = self._get_function_name(node.func)
                
                # Check for taint sources
                if func_name in self.sources:
                    # Mark return value as tainted
                    parent = getattr(node, 'parent', None)
                    if isinstance(parent, ast.Assign):
                        for target in parent.targets:
                            if isinstance(target

                            
