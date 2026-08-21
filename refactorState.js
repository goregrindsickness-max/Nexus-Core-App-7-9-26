import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add isHydrated state
content = content.replace(
  'const [shows, setShows] = useState<Show[]>([]);',
  `const [shows, setShows] = useState<Show[]>([]);\n  const [isHydrated, setIsHydrated] = useState(false);`
);

// 2. Add hydration for venues, offers, expenses, loyaltyMembers, cashTransactions, blockedPromoters
const hydrateAdditions = `
        const vens = await venuesStore.getItem('nexus_master_venues');
        if (vens) setVenues(JSON.parse(vens));
        else {
          const oldV = localStorage.getItem('nexus_core_venues');
          if (oldV) setVenues(JSON.parse(oldV));
        }

        const offs = await offersStore.getItem('nexus_master_offers');
        if (offs) setOffers(JSON.parse(offs));
        else {
          const oldO = localStorage.getItem('nexus_core_offers_offline');
          if (oldO) setOffers(JSON.parse(oldO));
        }

        const exps = await expensesStore.getItem('nexus_master_expenses');
        if (exps) setExpenses(JSON.parse(exps));
        else {
          const oldE = localStorage.getItem('nexus_core_expenses');
          if (oldE) setExpenses(JSON.parse(oldE));
        }

        const lm = localStorage.getItem('nexus_core_loyalty_members');
        if (lm) setLoyaltyMembers(JSON.parse(lm));
        
        const ct = localStorage.getItem('nexus_core_cash_transactions');
        if (ct) setCashTransactions(JSON.parse(ct));
        
        const bp = localStorage.getItem('nexus_core_blocked_promoters');
        if (bp) setBlockedPromoters(JSON.parse(bp));

        setIsHydrated(true);
`;

content = content.replace(
  "const revs = await reviewsStore.getItem('nexus_master_reviews');\n        if (revs) setUserReviews(JSON.parse(revs as string));",
  `const revs = await reviewsStore.getItem('nexus_master_reviews');\n        if (revs) setUserReviews(JSON.parse(revs as string));\n` + hydrateAdditions
);

// We must also update the catch block to set isHydrated
content = content.replace(
  "console.error('IDB Hydration Error:', err);",
  "console.error('IDB Hydration Error:', err);\n        setIsHydrated(true);"
);

// 3. Rewrite useState for blockedPromoters, cashTransactions, expenses, venues, offers, loyaltyMembers
content = content.replace(
  /const \[blockedPromoters, setBlockedPromoters\] = useState<string\[\]>\(\(\) => {[\s\S]*?return \[\];\n  }\);/,
  "const [blockedPromoters, setBlockedPromoters] = useState<string[]>([]);"
);

content = content.replace(
  /const \[cashTransactions, setCashTransactions\] = useState<import\('\.\/types'\)\.CashTransaction\[\]>\(\(\) => {[\s\S]*?return \[\];\n  }\);/,
  "const [cashTransactions, setCashTransactions] = useState<import('./types').CashTransaction[]>([]);"
);

content = content.replace(
  /const \[expenses, setExpenses\] = useState<\{ id: string; description: string; amount: number; date: string \}\[\]>\(\(\) => {[\s\S]*?return \[\];\n  }\);/,
  "const [expenses, setExpenses] = useState<{ id: string; description: string; amount: number; date: string }[]>([]);"
);

content = content.replace(
  /const \[venues, setVenues\] = useState<import\('\.\/types'\)\.Venue\[\]>\(\(\) => {[\s\S]*?return \[\];\n  }\);/,
  "const [venues, setVenues] = useState<import('./types').Venue[]>([]);"
);

content = content.replace(
  /const \[offers, setOffers\] = useState<Offer\[\]>\(\(\) => {[\s\S]*?return \[\];\n  }\);/,
  "const [offers, setOffers] = useState<Offer[]>([]);"
);

content = content.replace(
  /const \[loyaltyMembers, setLoyaltyMembers\] = useState<LoyaltyMember\[\]>\(\(\) => {[\s\S]*?return \[\];\n  }\);/,
  "const [loyaltyMembers, setLoyaltyMembers] = useState<LoyaltyMember[]>([]);"
);

// 4. Update the effects that save to localStorage to also check isHydrated and use Stores
content = content.replace(
  /useEffect\(\(\) => {\n    try {\n      localStorage\.setItem\('nexus_core_venues', JSON\.stringify\(venues\)\);\n    } catch \(e\) {\n      console\.error\('Failed to save venues to localStorage:', e\);\n    }\n  }, \[venues\]\);/,
  `useEffect(() => {
    if (!isHydrated) return;
    try {
      venuesStore.setItem('nexus_master_venues', JSON.stringify(venues)).catch(e => console.warn(e));
      localStorage.setItem('nexus_core_venues', JSON.stringify(venues));
    } catch (e) {
      console.error('Failed to save venues:', e);
    }
  }, [venues, isHydrated]);`
);

content = content.replace(
  /useEffect\(\(\) => {\n    try {\n      localStorage\.setItem\('nexus_core_offers_offline', JSON\.stringify\(offers\)\);\n    } catch \(e\) {\n      console\.error\('Failed to save offers to localStorage:', e\);\n    }\n  }, \[offers\]\);/,
  `useEffect(() => {
    if (!isHydrated) return;
    try {
      offersStore.setItem('nexus_master_offers', JSON.stringify(offers)).catch(e => console.warn(e));
      localStorage.setItem('nexus_core_offers_offline', JSON.stringify(offers));
    } catch (e) {
      console.error('Failed to save offers:', e);
    }
  }, [offers, isHydrated]);`
);

content = content.replace(
  /useEffect\(\(\) => {\n    localStorage\.setItem\('nexus_core_blocked_promoters', JSON\.stringify\(blockedPromoters\)\);\n  }, \[blockedPromoters\]\);/,
  `useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('nexus_core_blocked_promoters', JSON.stringify(blockedPromoters));
  }, [blockedPromoters, isHydrated]);`
);

content = content.replace(
  /useEffect\(\(\) => {\n    try {\n      localStorage\.setItem\('nexus_core_loyalty_members', JSON\.stringify\(loyaltyMembers\)\);\n    } catch \(e\) {\n      console\.error\('Failed to save loyalty members to localStorage:', e\);\n    }\n  }, \[loyaltyMembers\]\);/,
  `useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('nexus_core_loyalty_members', JSON.stringify(loyaltyMembers));
    } catch (e) {
      console.error('Failed to save loyalty members:', e);
    }
  }, [loyaltyMembers, isHydrated]);`
);

fs.writeFileSync('src/App.tsx.new', content);
console.log("Refactoring complete");
