import os
import re

SCREENS_DIR = "/Users/admin/quanlirapphim-mvc-net/mobile-app-expo/src/screens"

COLOR_MAP = {
    # Backgrounds
    r"backgroundColor:\s*['\"]#(111|1a1a1a|1a1a2e|12121e|0a0a0a|222)['\"]": r"backgroundColor: Theme.colors.surface",
    r"backgroundColor:\s*['\"]#(000|0d0d0d)['\"]": r"backgroundColor: Theme.colors.background",
    r"backgroundColor:\s*['\"]#(333|444|555)['\"]": r"backgroundColor: Theme.colors.cardBorder",
    
    # Text Colors
    r"color:\s*['\"]#fff(fff)?['\"]": r"color: Theme.colors.textPrimary",
    r"color:\s*['\"]#(aaa|888|ccc|999)['\"]": r"color: Theme.colors.textSecondary",
    r"color:\s*['\"]#(666|555|444)['\"]": r"color: Theme.colors.textMuted",
    
    # Borders
    r"borderColor:\s*['\"]#(333|222|1a1a2e|2d2d44|444)['\"]": r"borderColor: Theme.colors.cardBorder",
    r"borderBottomColor:\s*['\"]#(222|1a1a2e|333)['\"]": r"borderBottomColor: Theme.colors.cardBorder",
    r"borderTopColor:\s*['\"]#(333|222)['\"]": r"borderTopColor: Theme.colors.cardBorder",
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    for pattern, replacement in COLOR_MAP.items():
        content = re.sub(pattern, replacement, content)

    if content != original_content:
        # Check if Theme is imported
        if "from '../../theme/tokens'" not in content and "from '../theme/tokens'" not in content and "from '../../../theme/tokens'" not in content:
            # Determine path depth
            depth = filepath.replace(SCREENS_DIR, "").count("/")
            if depth == 1:
                import_path = "'../theme/tokens'"
            elif depth == 2:
                import_path = "'../../theme/tokens'"
            elif depth == 3:
                import_path = "'../../../theme/tokens'"
            else:
                import_path = "'../../theme/tokens'"
            
            # Add import after the last import statement
            imports_end = [m.end() for m in re.finditer(r"^import .+$", content, re.MULTILINE)]
            if imports_end:
                pos = imports_end[-1]
                content = content[:pos] + f"\nimport {{ Theme }} from {import_path};" + content[pos:]
            else:
                content = f"import {{ Theme }} from {import_path};\n" + content
                
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, _, files in os.walk(SCREENS_DIR):
    for file in files:
        if file.endswith(('.tsx', '.ts')) and "styles.ts" not in file:
            process_file(os.path.join(root, file))

for root, _, files in os.walk(SCREENS_DIR):
    for file in files:
        if file.endswith('styles.ts'):
            process_file(os.path.join(root, file))

print("Done.")
