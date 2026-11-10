with open('components/contract/ContractPreviewV2.tsx', 'r') as f:
    content = f.read()

# Replace apostrophe character (') with HTML entity
content = content.replace("'", "'")

with open('components/contract/ContractPreviewV2.tsx', 'w') as f:
    f.write(content)

print('Done')