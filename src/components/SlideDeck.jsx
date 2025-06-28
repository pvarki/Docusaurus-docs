import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

/**
 * SlideDeck component.
 * @param {string} deckPath - The relative path for the deck, e.g. "deployapp/login/01-login".
 * @param {number} height - The height of the iframe.
 */
function SlideDeck({ deckPath = 'index', height = 600 }) {
  const { i18n } = useDocusaurusContext();
  const locale = i18n.currentLocale;
  const src = useBaseUrl(`/decks/${locale}/${deckPath}/index.html`);


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
