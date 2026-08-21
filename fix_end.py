import re
with open("src/components/UniversalSocialFeed.tsx", "r") as f:
    text = f.read()

# Remove the previously appended stuff if it exists
text = re.sub(r'(\s*</div>\s*\);\s*\{isEmbedded.*)$', '', text, flags=re.DOTALL)
text = re.sub(r'(\s*</div>\s*\);\s*})$', '', text)

# Now append it correctly
text += """
      {isEmbedded && cartItems.length > 0 && (
        <motion.div
          drag
          dragMomentum={false}
          className="fixed bottom-24 right-4 z-[9999] cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-14 h-14 rounded-full bg-[#00ffcc] shadow-xl shadow-[#00ffcc]/20 flex items-center justify-center text-black border-2 border-[#00ffcc]"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-[#00ffcc] rounded-full flex items-center justify-center text-[10px] font-black shadow-lg border border-[#00ffcc]">
              {cartItems.reduce((acc, item: any) => acc + item.quantity, 0)}
            </span>
          </button>
        </motion.div>
      )}
    </div>
  );
}
"""

with open("src/components/UniversalSocialFeed.tsx", "w") as f:
    f.write(text)

print("Done")
