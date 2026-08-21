import re
with open("src/components/ReleasesCatalogTab.tsx", "r") as f:
    text = f.read()

# Update handleAddFullReleaseSubmit
text = text.replace('const newReleaseObj = {\n      id: newId,\n      catalogId: newReleaseCatalogId,\n      title: newReleaseTitle,\n      coverColor: newReleaseColor,\n      type: newReleaseFormatType,\n      releaseDate: newReleaseDate,', 
'''const newReleaseObj = {
      id: newId,
      catalogId: newReleaseCatalogId,
      title: newReleaseTitle,
      coverColor: newReleaseColor,
      type: newReleaseFormatType,
      releaseDate: newReleaseDate,
      label: newReleaseLabel,
      genre: newReleaseGenre,
      coverImage: newReleaseCoverImage,
      tracks: newReleaseTracks,'''
)

# Reset state at end of submit
text = text.replace("setNewReleaseTitle('');\n    setNewReleaseCatalogId('');\n    setNewReleaseDate('');",
'''setNewReleaseTitle('');
    setNewReleaseCatalogId('');
    setNewReleaseDate('');
    setNewReleaseLabel('');
    setNewReleaseGenre('');
    setNewReleaseCoverImage(null);
    setNewReleaseTracks([]);''')

with open("src/components/ReleasesCatalogTab.tsx", "w") as f:
    f.write(text)
print("Updated handleAddFullReleaseSubmit.")
