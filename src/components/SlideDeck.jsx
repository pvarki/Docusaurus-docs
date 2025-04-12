import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

/**
 * SlideDeck component.
 * @param {string} deckPath - The relative path for the deck, e.g. "deployapp/login/01-login".
 * @param {number} height - The height of the iframe.
 */
function SlideDeck({ deckPath = 'index', height = 600 }) {
  const { i18n } = useDocusaurusContext();
  // i18n.currentLocale will be, e.g., "en" or "fi"
  const locale = i18n.currentLocale;
  // Construct the URL based on the locale and the provided deckPath.
  const src = `/slides/${locale}/${deckPath}/index.html`;

  return (
    <iframe
      src={src}
      title={`Slide Deck: ${deckPath}`}
      width="100%"
      height={height}
      overflow='hidden'
      style={{ border: 0 }}
      allow="fullscreen; autoplay; clipboard-write"
      allowFullScreen
    />
  );
}

export default SlideDeck;
