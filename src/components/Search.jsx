import React, { useState } from 'react';
import styles from './Search.module.css';

const NAV_ITEMS = [
  'Home',
  'Artwork',
  'Artist',
  'About',
  'Blog',
  'Contest',
  'Contact',
];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraHint, setCameraHint] = useState('');

  const handleCameraClick = () => {
    const picker = document.getElementById('image-search-input');
    if (picker) {
      picker.click();
    }
  };

  const handleImageSearch = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const cleanedName = selectedFile.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();

    const inferredQuery = cleanedName || 'artwork';
    setSearchQuery(inferredQuery);
    setCameraHint(`Image selected: ${selectedFile.name}`);
  };

  return (
    <div className={styles.pageShell}>
      <header className={styles.headerWrap}>
        <div className={styles.topRow}>
          <h1 className={styles.brandTitle}>zigguratss</h1>

          <div className={styles.searchBar}>
            <svg
              className={styles.searchIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                if (cameraHint) {
                  setCameraHint('');
                }
              }}
              className={styles.searchInput}
              placeholder="What are you searching for? Surrealism"
              aria-label="Search artworks"
            />

            <input
              id="image-search-input"
              className={styles.hiddenFileInput}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSearch}
              aria-label="Upload image to search"
            />

            <button
              className={styles.cameraButton}
              aria-label="Search by image"
              onClick={handleCameraClick}
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h3l2-2h6l2 2h3v12H4z"></path>
                <circle cx="12" cy="13" r="3"></circle>
              </svg>
            </button>
          </div>
          {cameraHint && <p className={styles.cameraHint}>{cameraHint}</p>}
        </div>

        <nav className={styles.navBar}>
          {NAV_ITEMS.map((item) => (
            <a href="#" key={item} className={styles.navLink}>
              {item}
              {(item === 'Artwork' || item === 'Artist') && (
                <span className={styles.navCaret}>▾</span>
              )}
            </a>
          ))}

          <div className={styles.navIcons}>
            <button className={styles.navIconButton} type="button" aria-label="Seller profile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M5 20c0-3.5 3.5-6 7-6s7 2.5 7 6"></path>
              </svg>
            </button>

            <button className={styles.navIconButton} type="button" aria-label="Shop cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="20" r="1"></circle>
                <circle cx="18" cy="20" r="1"></circle>
                <path d="M3 4h2l2.2 10.5a1 1 0 0 0 1 .8h9.5a1 1 0 0 0 1-.8L21 7H7"></path>
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <main className={styles.emptySpace} aria-label="Homepage content placeholder"></main>
    </div>
  );
};

export default Search;
