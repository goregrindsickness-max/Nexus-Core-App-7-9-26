import fs from 'fs';
let content = fs.readFileSync('src/components/SettingsWorkspace.tsx', 'utf-8');

const handlers = `
  const handleMicroGenreSelect = (genre) => {
    if (props.setSelectedMicroGenres) {
      props.setSelectedMicroGenres(prev => 
        prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre].slice(0, 3)
      );
    }
  };

  const handleBandInfoSubmit = async () => {
    if (!props.activeBand) return;
    const updated = {
      ...props.activeBand,
      name: props.bandInfoName,
      homebase: props.bandInfoHomebase,
      genre: props.selectedMicroGenres.join(', '),
      lineup: props.bandLineup,
      cover_url: props.bandCoverUrl,
      logo_url: props.bandLogoUrl
    };
    if (props.setEditingBand) props.setEditingBand(updated);
    if (props.setIsBandModalOpen) props.setIsBandModalOpen(true);
    if (props.triggerNotification) props.triggerNotification('Band information staged for update.');
  };

  const handleReviewSubmit = () => {
    const finalComment = props.reviewText.trim() || "Full-featured tour manager. Love the offline sync and live operations tracking!";
    const newReviewObj = {
      id: Date.now().toString(),
      text: finalComment,
      rating: props.reviewScore,
      name: props.reviewerName || "Verified Crew",
      group: props.reviewerGroup || props.activeBand?.name || "Independent Artist",
      created_at: new Date().toISOString(),
      is_synced: false
    };
    const updatedReviews = [newReviewObj, ...(props.userReviews || [])];
    if (props.setUserReviews) props.setUserReviews(updatedReviews);
    localStorage.setItem('nexus_core_user_reviews', JSON.stringify(updatedReviews));
    if (props.setReviewLeft) props.setReviewLeft(true);
    if (props.triggerNotification) props.triggerNotification('Review cached securely. Awaiting sync.');
  };
`;

content = content.replace('  return (', handlers + '\n  return (');
content = content.replace(/reviewLeft/g, 'props.reviewLeft');
content = content.replace(/props\.props\.reviewLeft/g, 'props.reviewLeft');
content = content.replace(/setprops\.reviewLeft/g, 'setReviewLeft');

fs.writeFileSync('src/components/SettingsWorkspace.tsx', content);
