import fs from 'fs';

const filePath = 'src/components/TourNotesView.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /({\/\* ============================== \*\/}\n\s*{\/\* MUSICIAN'S TACTICAL ROAD KITS \*\/}\n\s*{\/\* ============================== \*\/}\n\s*<div id="musician-tactical-kits"[\s\S]*?)(\s*)(?={\/\* TOP WORKSPACE: INLINE NOTE CREATOR \*\/})/s;

const match = content.match(regex);
if (match) {
  const block = match[1];
  content = content.replace(block, '');
  
  // The end of the "notes container" looks like this:
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //
  //       {/* FLOAT ACTION BUTTON FOR NOTES WRAPPER (HI FIDELITY ACCORDING TO SCREENSHOT 2) */}
  
  const insertRegex = /(\s*)({\/\* FLOAT ACTION BUTTON FOR NOTES WRAPPER \(HI FIDELITY ACCORDING TO SCREENSHOT 2\) \*\/})/;
  
  const insertMatch = content.match(insertRegex);
  if (insertMatch) {
    // wait I need to insert it inside the <div className="p-4 space-y-4 max-w-4xl mx-auto w-full"> container,
    // which is the parent of LIST OF NOTATIONS CARDS. 
    // The previous div structure:
    //             </div>
    //           )}
    //         </div>
    //       </div>      <-- this closes the max-w-4xl mx-auto container
    //
    // So to put it UNDER the actual notes list but INSIDE the layout container,
    // I should put it before the closing </div> of that container.
    // Let's replace:
    //         </div>
    //       </div>
    //       {/* FLOAT...
    // with:
    //         </div>
    //         {block}
    //       </div>
    //       {/* FLOAT...
    content = content.replace(
      /\s*<\/div>\n\s*<\/div>\n\s*\{\/\* FLOAT ACTION BUTTON FOR NOTES WRAPPER/,
      `\n        </div>\n${block}\n      </div>\n\n      {/* FLOAT ACTION BUTTON FOR NOTES WRAPPER`
    );
    
    fs.writeFileSync(filePath, content);
    console.log("Successfully moved toolkit.");
  } else {
    console.log("Failed to find insertion point.");
  }
} else {
  console.log("Failed to find Toolkit block.");
}
