import re

with open('components/contract/ContractPreviewV2.tsx', 'r') as f:
    content = f.read()

# Replace literal double quotes with HTML entities
# The new string uses the literal HTML entity "
old = '<strong>"LAS PARTES"</strong>'
# Build the new string with literal " characters
new = '<strong>' + '&' + 'quot;' + 'LAS PARTES' + '&' + 'quot;' + '</strong>'

content = content.replace(old, new)

with open('components/contract/ContractPreviewV2.tsx', 'w') as f:
    f.write(content)

print('Done')
print(f'Replaced: {old}')
print(f'With: {new}')