Teach me how to use the ast module in Python. Provide a masterclass pls and demonstrate instruct and insight upon all the tips and tricks you know. Pass deep knowledge and practical insights! 


I'll guide you through Python's `ast` module with practical examples and advanced techniques. The Abstract Syntax Tree (AST) module is one of Python's most powerful tools for code analysis, transformation, and metaprogramming.

## Understanding ASTs: The Foundation

An Abstract Syntax Tree represents Python code as a tree structure where each node corresponds to a syntactic construct. Think of it as Python's way of understanding code structure programmatically.

```python
import ast
import inspect

# Let's start with a simple example
code = """
def greet(name):
    return f"Hello, {name}!"
"""

# Parse the code into an AST
tree = ast.parse(code)

# Dump the tree structure to see what we're working with
print(ast.dump(tree, indent=2))
```

## Core AST Operations

### 1. Parsing and Walking Trees

```python
# Three main ways to parse code
tree = ast.parse(code)  # Parse a string of code
expr = ast.parse("x + 1", mode='eval')  # Parse an expression
single = ast.parse("x = 1", mode='single')  # Parse a single statement

# Walking trees with NodeVisitor
class FunctionCollector(ast.NodeVisitor):
    def __init__(self):
        self.functions = []
    
    def visit_FunctionDef(self, node):
        self.functions.append({
            'name': node.name,
            'args': [arg.arg for arg in node.args.args],
            'lineno': node.lineno
        })
        self.generic_visit(node)  # Continue visiting child nodes

# Use the visitor
collector = FunctionCollector()
collector.visit(tree)
print(collector.functions)
```

### 2. Advanced Tree Analysis

```python
class ComplexityAnalyzer(ast.NodeVisitor):
    """Analyze code complexity by counting control flow statements"""
    
    def __init__(self):
        self.complexity = 0
        self.function_complexities = {}
        self.current_function = None
    
    def visit_FunctionDef(self, node):
        old_function = self.current_function
        self.current_function = node.name
        old_complexity = self.complexity
        self.complexity = 1  # Base complexity
        
        self.generic_visit(node)
        
        self.function_complexities[node.name] = self.complexity
        self.current_function = old_function
        self.complexity = old_complexity
    
    def visit_If(self, node):
        self.complexity += 1
        self.generic_visit(node)
    
    def visit_For(self, node):
        self.complexity += 1
        self.generic_visit(node)
    
    def visit_While(self, node):
        self.complexity += 1
        self.generic_visit(node)
    
    def visit_ExceptHandler(self, node):
        self.complexity += 1
        self.generic_visit(node)

# Example usage
complex_code = """
def process_data(items):
    result = []
    for item in items:
        if item > 0:
            try:
                value = 100 / item
                if value > 10:
                    result.append(value)
            except ZeroDivisionError:
                pass
    return result
"""

analyzer = ComplexityAnalyzer()
analyzer.visit(ast.parse(complex_code))
print(f"Complexity scores: {analyzer.function_complexities}")
```

## AST Transformation: The Power Move

### 3. Modifying Code with NodeTransformer

```python
class ConstantFolder(ast.NodeTransformer):
    """Optimize constant expressions at compile time"""
    
    def visit_BinOp(self, node):
        self.generic_visit(node)  # Visit children first
        
        # Check if both operands are constants
        if isinstance(node.left, ast.Constant) and isinstance(node.right, ast.Constant):
            try:
                # Evaluate the operation
                if isinstance(node.op, ast.Add):
                    value = node.left.value + node.right.value
                elif isinstance(node.op, ast.Sub):
                    value = node.left.value - node.right.value
                elif isinstance(node.op, ast.Mult):
                    value = node.left.value * node.right.value
                elif isinstance(node.op, ast.Div):
                    value = node.left.value / node.right.value
                else:
                    return node
                
                # Replace with constant
                return ast.Constant(value=value)
            except:
                return node
        
        return node

# Example
code_to_optimize = "x = 2 + 3 * 4 - 1"
tree = ast.parse(code_to_optimize)
optimized = ConstantFolder().visit(tree)
print(ast.unparse(optimized))  # Python 3.9+
```

### 4. Advanced Code Injection

```python
class AutoLogger(ast.NodeTransformer):
    """Automatically add logging to function calls"""
    
    def visit_FunctionDef(self, node):
        # Create logging statement
        log_stmt = ast.Expr(
            value=ast.Call(
                func=ast.Attribute(
                    value=ast.Name(id='logger', ctx=ast.Load()),
                    attr='info',
                    ctx=ast.Load()
                ),
                args=[
                    ast.JoinedStr(
                        values=[
                            ast.Constant(value=f"Calling {node.name} with args: "),
                            ast.FormattedValue(
                                value=ast.Name(id='args', ctx=ast.Load()),
                                conversion=-1
                            ),
                            ast.Constant(value=" kwargs: "),
                            ast.FormattedValue(
                                value=ast.Name(id='kwargs', ctx=ast.Load()),
                                conversion=-1
                            )
                        ]
                    )
                ],
                keywords=[]
            )
        )
        
        # Insert at beginning of function
        node.body.insert(0, log_stmt)
        
        # Add wrapper to capture args
        wrapper_code = f"""
def {node.name}_wrapper(*args, **kwargs):
    logger.info(f"Calling {node.name} with args: {{args}} kwargs: {{kwargs}}")
    result = {node.name}_original(*args, **kwargs)
    logger.info(f"{node.name} returned: {{result}}")
    return result
"""
        
        self.generic_visit(node)
        return node

# Apply transformation
logged_code = """
def calculate(x, y):
    return x * y + 10
"""

transformer = AutoLogger()
tree = ast.parse(logged_code)
modified = transformer.visit(tree)
ast.fix_missing_locations(modified)  # Important: fix line numbers
```

## Pro Techniques and Patterns

### 5. Custom Code Analysis Tools

```python
class SecurityAnalyzer(ast.NodeVisitor):
    """Detect potential security issues in code"""
    
    DANGEROUS_FUNCTIONS = {'eval', 'exec', 'compile', '__import__'}
    
    def __init__(self):
        self.issues = []
    
    def visit_Call(self, node):
        # Check for dangerous function calls
        if isinstance(node.func, ast.Name) and node.func.id in self.DANGEROUS_FUNCTIONS:
            self.issues.append({
                'type': 'dangerous_function',
                'function': node.func.id,
                'line': node.lineno,
                'severity': 'high'
            })
        
        # Check for SQL injection patterns
        if isinstance(node.func, ast.Attribute):
            if node.func.attr in ['execute', 'executemany']:
                # Check if using string formatting
                if node.args and isinstance(node.args[0], ast.JoinedStr):
                    self.issues.append({
                        'type': 'possible_sql_injection',
                        'line': node.lineno,
                        'severity': 'high'
                    })
        
        self.generic_visit(node)
    
    def visit_Import(self, node):
        # Check for suspicious imports
        for alias in node.names:
            if alias.name in ['pickle', 'marshal']:
                self.issues.append({
                    'type': 'unsafe_deserialization',
                    'module': alias.name,
                    'line': node.lineno,
                    'severity': 'medium'
                })
        
        self.generic_visit(node)

# Usage
suspicious_code = """
import pickle

def process_user_input(user_data):
    query = f"SELECT * FROM users WHERE id = {user_data}"
    cursor.execute(query)
    
    eval(user_data)
"""

analyzer = SecurityAnalyzer()
analyzer.visit(ast.parse(suspicious_code))
for issue in analyzer.issues:
    print(f"Security Issue: {issue}")
```

### 6. AST-based Code Generation

```python
def create_dataclass(class_name, fields):
    """Generate a dataclass programmatically using AST"""
    
    # Create class definition
    class_def = ast.ClassDef(
        name=class_name,
        bases=[],
        keywords=[],
        body=[],
        decorator_list=[ast.Name(id='dataclass', ctx=ast.Load())]
    )
    
    # Add fields as annotated assignments
    for field_name, field_type in fields.items():
        ann_assign = ast.AnnAssign(
            target=ast.Name(id=field_name, ctx=ast.Store()),
            annotation=ast.Name(id=field_type, ctx=ast.Load()),
            simple=1
        )
        class_def.body.append(ann_assign)
    
    # Create module
    module = ast.Module(body=[
        ast.ImportFrom(
            module='dataclasses',
            names=[ast.alias(name='dataclass', asname=None)],
            level=0
        ),
        class_def
    ], type_ignores=[])
    
    # Fix locations and compile
    ast.fix_missing_locations(module)
    return compile(module, '<generated>', 'exec')

# Generate and execute
fields = {'name': 'str', 'age': 'int', 'email': 'str'}
code = create_dataclass('Person', fields)
namespace = {}
exec(code, namespace)

# Now we can use the generated class
Person = namespace['Person']
p = Person(name="Alice", age=30, email="alice@example.com")
print(p)
```

### 7. Pattern Matching and Code Search

```python
class PatternMatcher(ast.NodeVisitor):
    """Find specific code patterns"""
    
    def __init__(self, pattern):
        self.pattern = ast.parse(pattern).body[0]
        self.matches = []
    
    def match_pattern(self, node, pattern):
        """Recursively match AST patterns"""
        if type(node) != type(pattern):
            return False
        
        if isinstance(pattern, ast.Name) and pattern.id.startswith('$'):
            # Wildcard matching
            return True
        
        for field, value in ast.iter_fields(pattern):
            if not hasattr(node, field):
                return False
            
            node_value = getattr(node, field)
            
            if isinstance(value, list):
                if len(node_value) != len(value):
                    return False
                for nv, pv in zip(node_value, value):
                    if not self.match_pattern(nv, pv):
                        return False
            elif isinstance(value, ast.AST):
                if not self.match_pattern(node_value, value):
                    return False
            else:
                if node_value != value:
                    return False
        
        return True
    
    def visit(self, node):
        if self.match_pattern(node, self.pattern):
            self.matches.append(node)
        self.generic_visit(node)

# Find all dictionary comprehensions
code_to_search = """
data = {k: v*2 for k, v in items.items()}
result = {x: x**2 for x in range(10)}
simple = [x for x in range(5)]  # Not a dict comp
"""

pattern = "{$k: $v for $k, $v in $iter}"
# Note: This is simplified - real pattern matching is more complex
```

## Essential Tips and Best Practices

### 8. Debugging AST Code

```python
def debug_ast(code):
    """Enhanced AST debugging helper"""
    tree = ast.parse(code)
    
    class DebugVisitor(ast.NodeVisitor):
        def __init__(self):
            self.depth = 0
        
        def visit(self, node):
            indent = "  " * self.depth
            attrs = []
            for field, value in ast.iter_fields(node):
                if isinstance(value, list):
                    if value and isinstance(value[0], ast.AST):
                        attrs.append(f"{field}=[{len(value)} items]")
                    else:
                        attrs.append(f"{field}={value}")
                elif isinstance(value, ast.AST):
                    attrs.append(f"{field}=<{type(value).__name__}>")
                else:
                    attrs.append(f"{field}={repr(value)}")
            
            print(f"{indent}{type(node).__name__}({', '.join(attrs)})")
            
            self.depth += 1
            self.generic_visit(node)
            self.depth -= 1
    
    DebugVisitor().visit(tree)

# Use for debugging
debug_ast("x = [i**2 for i in range(10) if i % 2 == 0]")
```

### 9. Performance Optimization Techniques

```python
# Cache parsed ASTs for repeated analysis
from functools import lru_cache

@lru_cache(maxsize=128)
def cached_parse(code):
    return ast.parse(code)

# Use ast.literal_eval for safe evaluation
safe_data = ast.literal_eval("[1, 2, {'key': 'value'}]")

# Compile AST to code object for execution
tree = ast.parse("result = sum([1, 2, 3, 4, 5])")
code_obj = compile(tree, '<ast>', 'exec')
namespace = {}
exec(code_obj, namespace)
print(namespace['result'])
```

### 10. Real-world Application: Custom Linter

```python
class CustomLinter(ast.NodeVisitor):
    """Production-ready linting example"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.current_class = None
        self.current_function = None
    
    def add_error(self, node, message):
        self.errors.append({
            'line': node.lineno,
            'col': node.col_offset,
            'message': message,
            'context': f"{self.current_class or ''}.{self.current_function or ''}"
        })
    
    def visit_FunctionDef(self, node):
        old_func = self.current_function
        self.current_function = node.name
        
        # Check function naming
        if not node.name.islower() and not node.name.startswith('_'):
            self.add_error(node, f"Function '{node.name}' should use snake_case")
        
        # Check for mutable default arguments
        for default in node.args.defaults:
            if isinstance(default, (ast.List, ast.Dict, ast.Set)):
                self.add_error(node, "Mutable default argument detected")
        
        self.generic_visit(node)
        self.current_function = old_func
    
    def visit_Name(self, node):
        # Check for undefined variables (simplified)
        if isinstance(node.ctx, ast.Store):
            if node.id in ['list', 'dict', 'set', 'int', 'str']:
                self.add_error(node, f"Shadowing built-in '{node.id}'")
        
        self.generic_visit(node)
```

The `ast` module is incredibly powerful for metaprogramming, code analysis, and transformation. Master these techniques and you'll be able to build sophisticated tools for code optimization, security analysis, custom transpilers, and more. Remember to always call `ast.fix_missing_locations()` after modifying an AST, and use `ast.NodeTransformer` for modifications and `ast.NodeVisitor` for analysis.


Excellent question! Let me take you deeper into the Python metaprogramming ecosystem and show you the powerful adjacent concepts that complement AST work.

## 1. Code Objects and Bytecode Manipulation

Python compiles to bytecode, and you can manipulate it directly!

```python
import dis
import types
import opcode

def explore_bytecode(func):
    """Disassemble and analyze bytecode"""
    print(f"Analyzing {func.__name__}:")
    dis.dis(func)
    
    # Access raw bytecode
    code = func.__code__
    print(f"\nCode object attributes:")
    print(f"  Arguments: {code.co_argcount}")
    print(f"  Variables: {code.co_varnames}")
    print(f"  Constants: {code.co_consts}")
    print(f"  Bytecode: {code.co_code.hex()}")

# Example function
def calculate(x, y):
    result = x * y + 10
    return result

explore_bytecode(calculate)

# Modify bytecode at runtime!
def create_optimized_function():
    # Create bytecode for: return x * 2
    bytecode = bytes([
        opcode.opmap['LOAD_FAST'], 0,      # Load x
        opcode.opmap['LOAD_CONST'], 1,     # Load 2
        opcode.opmap['BINARY_MULTIPLY'],    # Multiply
        opcode.opmap['RETURN_VALUE']        # Return
    ])
    
    # Create code object
    code = types.CodeType(
        1,  # argcount
        0,  # posonlyargcount
        1,  # kwonlyargcount
        1,  # nlocals
        2,  # stacksize
        0,  # flags
        bytecode,  # codestring
        (None, 2),  # constants
        (),  # names
        ('x',),  # varnames
        '<generated>',  # filename
        'double',  # name
        1,  # firstlineno
        b''  # lnotab
    )
    
    # Create function from code object
    return types.FunctionType(code, globals(), 'double')

double = create_optimized_function()
print(double(21))  # 42
```

## 2. inspect Module: Runtime Introspection

The `inspect` module is AST's runtime companion:

```python
import inspect
import textwrap

class AdvancedInspector:
    @staticmethod
    def analyze_callable(obj):
        """Deep inspection of any callable"""
        print(f"Analyzing: {obj}")
        
        # Get source code
        try:
            source = inspect.getsource(obj)
            print(f"Source:\n{textwrap.indent(source, '  ')}")
        except:
            print("Source not available")
        
        # Get signature
        sig = inspect.signature(obj)
        print(f"\nSignature: {sig}")
        
        # Analyze parameters
        for name, param in sig.parameters.items():
            print(f"  {name}:")
            print(f"    Kind: {param.kind}")
            print(f"    Default: {param.default}")
            print(f"    Annotation: {param.annotation}")
        
        # Get call hierarchy
        frame = inspect.currentframe()
        print("\nCall stack:")
        for frame_info in inspect.stack()[1:5]:
            print(f"  {frame_info.function} at {frame_info.filename}:{frame_info.lineno}")

# Advanced: Modify function behavior using inspect
def dynamic_decorator(func):
    sig = inspect.signature(func)
    params = list(sig.parameters.keys())
    
    def wrapper(*args, **kwargs):
        # Bind arguments to parameters
        bound = sig.bind(*args, **kwargs)
        bound.apply_defaults()
        
        # Log all arguments
        print(f"Calling {func.__name__} with:")
        for param, value in bound.arguments.items():
            print(f"  {param} = {value}")
        
        # Modify arguments dynamically
        if 'x' in bound.arguments:
            bound.arguments['x'] *= 2
        
        return func(**bound.arguments)
    
    return wrapper
```

## 3. Type Hints and Runtime Type Checking

Combine AST with typing for powerful runtime validation:

```python
import typing
from typing import get_type_hints, get_args, get_origin
import functools

class TypeValidator(ast.NodeVisitor):
    """Validate type hints in AST"""
    
    def __init__(self, type_hints):
        self.type_hints = type_hints
        self.errors = []
    
    def visit_FunctionDef(self, node):
        # Extract function type hints from AST
        for arg in node.args.args:
            if arg.annotation:
                print(f"Found annotation for {arg.arg}: {ast.unparse(arg.annotation)}")
        
        self.generic_visit(node)

# Runtime type enforcement decorator
def enforce_types(func):
    type_hints = get_type_hints(func)
    sig = inspect.signature(func)
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        bound = sig.bind(*args, **kwargs)
        
        # Check each argument
        for param_name, value in bound.arguments.items():
            if param_name in type_hints:
                expected_type = type_hints[param_name]
                
                # Handle generic types
                origin = get_origin(expected_type)
                if origin is list:
                    if not isinstance(value, list):
                        raise TypeError(f"{param_name} must be a list")
                    
                    # Check element types
                    element_type = get_args(expected_type)[0]
                    for item in value:
                        if not isinstance(item, element_type):
                            raise TypeError(f"List elements must be {element_type}")
                
                elif origin is None and not isinstance(value, expected_type):
                    raise TypeError(f"{param_name} must be {expected_type}")
        
        result = func(*args, **kwargs)
        
        # Check return type
        if 'return' in type_hints:
            expected_return = type_hints['return']
            if not isinstance(result, expected_return):
                raise TypeError(f"Return value must be {expected_return}")
        
        return result
    
    return wrapper

@enforce_types
def process_numbers(numbers: list[int]) -> int:
    return sum(numbers)
```

## 4. Metaclasses: The Class Factory

Metaclasses let you control class creation itself:

```python
class ASTMetaclass(type):
    """Metaclass that uses AST to analyze class definitions"""
    
    def __new__(mcs, name, bases, namespace, **kwargs):
        # Get the source code of the class
        frame = inspect.currentframe().f_back
        source_lines = inspect.getframeinfo(frame).code_context
        
        # Analyze methods using AST
        for key, value in namespace.items():
            if callable(value) and not key.startswith('_'):
                try:
                    source = inspect.getsource(value)
                    tree = ast.parse(source)
                    
                    # Add automatic logging
                    class LogInjector(ast.NodeTransformer):
                        def visit_FunctionDef(self, node):
                            log_stmt = ast.parse(f'print(f"Calling {key}")')
                            node.body.insert(0, log_stmt.body[0])
                            return node
                    
                    # Transform and recompile
                    tree = LogInjector().visit(tree)
                    ast.fix_missing_locations(tree)
                    
                    exec(compile(tree, '<metaclass>', 'exec'), namespace)
                except:
                    pass
        
        return super().__new__(mcs, name, bases, namespace)

class AutoLogged(metaclass=ASTMetaclass):
    def method1(self):
        return "Hello"
    
    def method2(self):
        return "World"

# More advanced: Property generation via metaclass
class AutoProperty(type):
    def __new__(mcs, name, bases, namespace):
        # Find all attributes that should become properties
        for key, value in list(namespace.items()):
            if key.startswith('_') and not key.startswith('__'):
                prop_name = key[1:]
                
                # Generate getter and setter
                def make_property(attr_name):
                    def getter(self):
                        return getattr(self, attr_name)
                    
                    def setter(self, value):
                        print(f"Setting {attr_name} to {value}")
                        setattr(self, attr_name, value)
                    
                    return property(getter, setter)
                
                namespace[prop_name] = make_property(key)
        
        return super().__new__(mcs, name, bases, namespace)
```

## 5. Import Hooks and Custom Importers

Control how Python imports modules:

```python
import sys
import importlib.abc
import importlib.machinery

class ASTTransformImporter(importlib.abc.MetaPathFinder, importlib.abc.Loader):
    """Import hook that transforms code using AST"""
    
    def find_spec(self, fullname, path, target=None):
        if fullname.startswith('transformed_'):
            return importlib.machinery.ModuleSpec(fullname, self)
        return None
    
    def create_module(self, spec):
        return None  # Use default module creation
    
    def exec_module(self, module):
        # Get the actual module name
        actual_name = module.__name__.replace('transformed_', '')
        
        # Load source code
        actual_module = importlib.import_module(actual_name)
        source = inspect.getsource(actual_module)
        
        # Transform using AST
        tree = ast.parse(source)
        
        class PerformanceTransformer(ast.NodeTransformer):
            def visit_FunctionDef(self, node):
                # Add timing to all functions
                timing_code = """
import time
_start = time.time()
"""
                end_timing = """
print(f"{func_name} took {time.time() - _start:.4f} seconds")
"""
                
                tree_start = ast.parse(timing_code).body
                tree_end = ast.parse(end_timing.replace('{func_name}', f'"{node.name}"')).body
                
                node.body = tree_start + node.body + tree_end
                return node
        
        tree = PerformanceTransformer().visit(tree)
        ast.fix_missing_locations(tree)
        
        # Execute transformed code
        exec(compile(tree, module.__file__ or '<transformed>', 'exec'), module.__dict__)

# Install the import hook
sys.meta_path.insert(0, ASTTransformImporter())

# Now imports are automatically transformed
# import transformed_mymodule  # This would transform mymodule
```

## 6. descriptor Protocol and Dynamic Attributes

```python
class ASTDescriptor:
    """Descriptor that validates using AST patterns"""
    
    def __init__(self, validator_expr):
        self.validator = validator_expr
        self.name = None
        
        # Parse validator expression
        self.validator_ast = ast.parse(validator_expr, mode='eval').body
    
    def __set_name__(self, owner, name):
        self.name = name
    
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__.get(self.name)
    
    def __set__(self, instance, value):
        # Create namespace for evaluation
        namespace = {'value': value, 'len': len, 'isinstance': isinstance}
        
        # Evaluate validator
        if not eval(compile(ast.Expression(self.validator_ast), '<validator>', 'eval'), namespace):
            raise ValueError(f"Validation failed for {self.name}: {self.validator}")
        
        instance.__dict__[self.name] = value

class ValidatedModel:
    name = ASTDescriptor("isinstance(value, str) and len(value) > 0")
    age = ASTDescriptor("isinstance(value, int) and 0 <= value <= 150")
    email = ASTDescriptor("'@' in value and '.' in value")
```

## 7. Code Generation and Templates

```python
class CodeGenerator:
    """Advanced code generation using AST"""
    
    @staticmethod
    def create_api_client(api_spec):
        """Generate API client from specification"""
        
        # Create module
        module = ast.Module(body=[], type_ignores=[])
        
        # Add imports
        module.body.append(
            ast.Import(names=[ast.alias(name='requests', asname=None)])
        )
        
        # Create class
        class_body = []
        
        # Add __init__ method
        init_method = ast.FunctionDef(
            name='__init__',
            args=ast.arguments(
                posonlyargs=[],
                args=[ast.arg(arg='self'), ast.arg(arg='base_url')],
                defaults=[],
                kwonlyargs=[],
                kw_defaults=[],
                kwarg=None,
                vararg=None
            ),
            body=[
                ast.Assign(
                    targets=[ast.Attribute(
                        value=ast.Name(id='self', ctx=ast.Load()),
                        attr='base_url',
                        ctx=ast.Store()
                    )],
                    value=ast.Name(id='base_url', ctx=ast.Load())
                )
            ],
            decorator_list=[]
        )
        class_body.append(init_method)
        
        # Generate methods for each endpoint
        for endpoint in api_spec['endpoints']:
            method = ast.FunctionDef(
                name=endpoint['name'],
                args=ast.arguments(
                    posonlyargs=[],
                    args=[ast.arg(arg='self')] + [
                        ast.arg(arg=param) for param in endpoint.get('params', [])
                    ],
                    defaults=[],
                    kwonlyargs=[],
                    kw_defaults=[],
                    kwarg=None,
                    vararg=None
                ),
                body=[
                    ast.Return(
                        value=ast.Call(
                            func=ast.Attribute(
                                value=ast.Name(id='requests', ctx=ast.Load()),
                                attr=endpoint['method'].lower(),
                                ctx=ast.Load()
                            ),
                            args=[
                                ast.JoinedStr(values=[
                                    ast.FormattedValue(
                                        value=ast.Attribute(
                                            value=ast.Name(id='self', ctx=ast.Load()),
                                            attr='base_url',
                                            ctx=ast.Load()
                                        ),
                                        conversion=-1
                                    ),
                                    ast.Constant(value=endpoint['path'])
                                ])
                            ],
                            keywords=[]
                        )
                    )
                ],
                decorator_list=[]
            )
            class_body.append(method)
        
        # Add class to module
        class_def = ast.ClassDef(
            name='APIClient',
            bases=[],
            keywords=[],
            body=class_body,
            decorator_list=[]
        )
        module.body.append(class_def)
        
        # Fix locations and compile
        ast.fix_missing_locations(module)
        return compile(module, '<generated>', 'exec')

# Use the generator
api_spec = {
    'endpoints': [
        {'name': 'get_users', 'method': 'GET', 'path': '/users'},
        {'name': 'create_user', 'method': 'POST', 'path': '/users', 'params': ['data']},
    ]
}

code = CodeGenerator.create_api_client(api_spec)
namespace = {}
exec(code, namespace)
APIClient = namespace['APIClient']
```

## 8. Abstract Base Classes with AST Validation

```python
from abc import ABCMeta, abstractmethod

class ASTValidatedMeta(ABCMeta):
    """Metaclass that validates implementations using AST"""
    
    def __call__(cls, *args, **kwargs):
        instance = super().__call__(*args, **kwargs)
        
        # Validate all abstract methods are properly implemented
        for name, method in inspect.getmembers(cls, predicate=inspect.isfunction):
            if hasattr(method, '__isabstractmethod__'):
                concrete_method = getattr(instance.__class__, name)
                source = inspect.getsource(concrete_method)
                tree = ast.parse(source)
                
                # Check implementation isn't just 'pass' or 'raise'
                func_def = tree.body[0]
                if len(func_def.body) == 1:
                    stmt = func_def.body[0]
                    if isinstance(stmt, ast.Pass):
                        raise NotImplementedError(f"{name} is not properly implemented (contains only 'pass')")
                    elif isinstance(stmt, ast.Raise):
                        raise NotImplementedError(f"{name} is not properly implemented (contains only 'raise')")
        
        return instance
```

## 9. Symbolic Execution and Static Analysis

```python
class SymbolicExecutor(ast.NodeVisitor):
    """Trace possible execution paths through code"""
    
    def __init__(self):
        self.paths = []
        self.current_path = []
        self.conditions = []
    
    def visit_If(self, node):
        # Branch: true path
        self.conditions.append(('if', ast.unparse(node.test)))
        self.current_path.append(f"if {ast.unparse(node.test)}")
        for stmt in node.body:
            self.visit(stmt)
        
        # Branch: false path
        if node.orelse:
            saved_path = self.current_path.copy()
            self.current_path.append(f"else (not {ast.unparse(node.test)})")
            for stmt in node.orelse:
                self.visit(stmt)
            self.paths.append(self.current_path)
            self.current_path = saved_path
    
    def visit_Return(self, node):
        self.current_path.append(f"return {ast.unparse(node.value)}")
        self.paths.append(self.current_path.copy())
```

## 10. Live Code Reloading with AST

```python
class HotReloader:
    """Reload code on the fly with AST transformations"""
    
    def __init__(self, module):
        self.module = module
        self.original_source = inspect.getsource(module)
        self.watchers = []
    
    def transform_and_reload(self, transformer):
        """Apply AST transformation and reload module"""
        
        # Parse current source
        tree = ast.parse(self.original_source)
        
        # Apply transformation
        tree = transformer.visit(tree)
        ast.fix_missing_locations(tree)
        
        # Compile and execute in module's namespace
        code = compile(tree, self.module.__file__, 'exec')
        exec(code, self.module.__dict__)
        
        # Notify watchers
        for watcher in self.watchers:
            watcher(self.module)
    
    def add_profiling(self):
        """Example: add profiling to all functions"""
        
        class ProfilingTransformer(ast.NodeTransformer):
            def visit_FunctionDef(self, node):
                # Inject profiling code
                profile_start = ast.parse("import cProfile; pr = cProfile.Profile(); pr.enable()").body
                profile_end = ast.parse("pr.disable(); pr.print_stats()").body
                
                node.body = profile_start + node.body + profile_end
                return node
        
        self.transform_and_reload(ProfilingTransformer())
```

These adjacent concepts form a powerful toolkit for metaprogramming in Python. Combine them with AST for:

- Runtime code modification
- Advanced debugging and profiling  
- Custom language features
- Code generation and templating
- Security analysis and sandboxing
- Performance optimization
- Testing and mocking frameworks
- Domain-specific languages (DSLs)

The key is understanding how these pieces fit together: AST for static analysis and transformation, bytecode for low-level optimization, metaclasses for class creation control, descriptors for attribute access, import hooks for module loading control, and inspect for runtime introspection.


