const fs = require("fs");
let code = fs.readFileSync("src/components/PromoterPortalView.tsx", "utf8");

// Revert 1
code = code.replace(
  `<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 w-full mt-2">
              
              {/* LEFT COLUMN: SWIPEABLE CALENDAR AND DATE PROFILE */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">`,
  `<div className="flex flex-col gap-6 relative z-10">`
);

// Revert 2
code = code.replace(
  `              </div>
              
              </div>
              
              {/* RIGHT COLUMN: ALL SHOWS & DRAFTS */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col">

                {/* COMPREHENSIVE CURRENT AND UPCOMING SHOWS & DRAFTS LIST */}
                <div 
                  className="w-full bg-black/60 border border-zinc-900/30 rounded-xl p-4 flex flex-col gap-3 min-h-[300px] lg:flex-grow lg:max-h-none h-full"
                >`,
  `              </div>
              
            </div>

                {/* COMPREHENSIVE CURRENT AND UPCOMING SHOWS & DRAFTS LIST */}
                <div 
                  className="w-full bg-black/60 border border-zinc-900/30 rounded-xl p-4 flex flex-col gap-3 min-h-[300px] max-h-[500px]"
                >`
);

// Revert 3
code = code.replace(
  `                  </div>
                </div>

              </div>
            </div>

            {/* Empty state description guide if utilizing the fallback venue stage */}`,
  `                  </div>
                </div>

            {/* Empty state description guide if utilizing the fallback venue stage */}`
);

fs.writeFileSync("src/components/PromoterPortalView.tsx", code);
console.log("Reverted");
