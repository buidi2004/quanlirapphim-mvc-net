import os
for r, d, f in os.walk('/home/buidi/quanlirapphim-mvc-net'):
    if any(x in r for x in ['node_modules', '.git', 'bin', 'obj', 'mysql_data']):
        continue
    for n in f:
        if n.endswith(('.cs', '.cshtml', '.tsx', '.ts')):
            p = os.path.join(r, n)
            try:
                with open(p, 'r', encoding='utf-8') as file:
                    c = file.read()
                c2 = c.replace('ffc107', '6f42c1').replace('e5a720', '6f42c1').replace('#e5a720', '#6f42c1').replace('#ffc107', '#6f42c1').replace('FFC107', '6F42C1')
                if c != c2:
                    with open(p, 'w', encoding='utf-8') as file:
                        file.write(c2)
                    print('Updated ' + p)
            except Exception as e:
                pass
