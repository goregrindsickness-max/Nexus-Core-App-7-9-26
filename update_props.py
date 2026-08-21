import re
with open("src/components/PublicStorefrontView.tsx", "r") as f:
    text = f.read()

text = text.replace('  storefrontSyncRecord?: Record<string, boolean>;\n  labelName: string;', 
'''  storefrontSyncRecord?: Record<string, boolean>;
  setStorefrontSyncRecord?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setCatalogReleases?: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  setCatalogApparel?: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  labelName: string;''')

text = text.replace('  storefrontSyncRecord = {},\n  labelName,',
'''  storefrontSyncRecord = {},
  setStorefrontSyncRecord,
  setCatalogReleases,
  setCatalogApparel,
  labelName,''')

with open("src/components/PublicStorefrontView.tsx", "w") as f:
    f.write(text)

with open("src/components/MerchWorkspaceWrapper.tsx", "r") as f:
    text = f.read()

text = text.replace('storefrontSyncRecord={storefrontSyncRecord}\n            labelName={activeBand?.name || \'MANAGED BAND\'}',
'''storefrontSyncRecord={storefrontSyncRecord}
            setStorefrontSyncRecord={setStorefrontSyncRecord}
            setCatalogReleases={setCatalogReleases}
            setCatalogApparel={setCatalogApparel}
            labelName={activeBand?.name || 'MANAGED BAND'}''')

with open("src/components/MerchWorkspaceWrapper.tsx", "w") as f:
    f.write(text)
print("Updated props.")
