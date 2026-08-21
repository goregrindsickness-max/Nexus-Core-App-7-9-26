import re
with open("src/components/UniversalSocialFeed.tsx", "r") as f:
    text = f.read()

# Change border colors
text = text.replace("border-red-600", "border-[#00ffcc]/30")
text = text.replace("border-red-950/30", "border-[#00ffcc]/30")
text = text.replace("hover:border-red-500/20", "hover:border-[#00ffcc]/40")
text = text.replace("border-red-950/40", "border-[#00ffcc]/30")

# For the post comments rendering around line 6700
# We want to change `{post.comments?.map(comment => (`
# to `{post.comments?.slice().reverse().map(comment => (`
text = text.replace("{post.comments?.map(comment => (", "{post.comments?.slice().reverse().map(comment => (")

# For the thread comments rendering
# We want to change `{thread.comments.map((comment: any) => (`
# to `{thread.comments.slice().reverse().map((comment: any) => (`
text = text.replace("{thread.comments.map((comment: any) => (", "{thread.comments.slice().reverse().map((comment: any) => (")


with open("src/components/UniversalSocialFeed.tsx", "w") as f:
    f.write(text)

print("Done")
