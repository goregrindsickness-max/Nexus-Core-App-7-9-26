const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const navMenuHeaderStart = `                <div className="p-4 border-b border-[#1b1e25] bg-[#07080a] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#00ffcc]/40 bg-zinc-800">`;

const newNavMenuHeader = `                <div className="p-4 border-b border-[#1b1e25] bg-[#07080a] flex items-center justify-between">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#00ffcc]/40 bg-zinc-800">`;
// Wait, the header block is already `flex items-center justify-between`.
// Let's replace the whole header block to include the X button.
