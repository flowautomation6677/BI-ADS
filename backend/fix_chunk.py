import re

filepath = '/tmp/client_chunk.js'
content = open(filepath, 'r', encoding='utf-8').read()

# Usa regex para substituir o valor de fallback no minified client chunk
# Padrão: ,i=r.get("dateRange")||"30d", onde 'i' pode ser qualquer letra
pattern = r'(.\=.\.get\("dateRange"\)\|\|)"30d"'
replacement = r'\g<1>"7d"'

new_content, count = re.subn(pattern, replacement, content)

if count > 0:
    open(filepath, 'w', encoding='utf-8').write(new_content)
    print(f"Substituidas {count} ocorrencias do fallback de '30d' para '7d'.")
else:
    print("Nenhuma ocorrencia de '30d' encontrada com o padrao regex.")
    
    # Debug: mostrar os matches mais proximos com get dateRange
    close_matches = re.findall(r'.{0,20}\"dateRange\".{0,30}', content)
    print("Possíveis matches encontrados:")
    for match in close_matches[:5]:
        print(repr(match))
