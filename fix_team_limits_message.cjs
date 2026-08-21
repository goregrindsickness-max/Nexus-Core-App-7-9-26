const fs = require('fs');
let file = fs.readFileSync('./src/components/TeamBillingTab.tsx', 'utf8');

file = file.replace(
  /You are currently utilizing \{occupiedSeats\} out of \{currentLimit\} available seats on the \{currentPlan\} plan\./,
  `You are currently utilizing {occupiedSeats} out of {currentLimit} available seats.`
);

fs.writeFileSync('./src/components/TeamBillingTab.tsx', file);
