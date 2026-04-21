import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const SEARCH_ITEMS = [
  {
    id: 1,
    title: 'Surreal Sunrise Canvas',
    description: 'Dreamlike oil painting with layered light and abstract forms.',
    tags: ['surrealism', 'canvas', 'oil'],
    category: 'Painting',
    popularity: 94,
    createdAt: '2026-03-10',
    thumbnail:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 2,
    title: 'Urban Rhythm Print',
    description: 'Limited-edition city print inspired by modern architecture.',
    tags: ['city', 'print', 'modern'],
    category: 'Prints',
    popularity: 88,
    createdAt: '2026-01-15',
    thumbnail:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 3,
    title: 'Minimal Clay Form',
    description: 'Hand-built ceramic sculpture with matte natural finish.',
    tags: ['ceramic', 'sculpture', 'minimal'],
    category: 'Sculpture',
    popularity: 76,
    createdAt: '2026-02-02',
    thumbnail:
      'https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 4,
    title: 'Monsoon Street Photo',
    description: 'Fine-art photograph capturing rain reflections at dusk.',
    tags: ['photography', 'street', 'rain'],
    category: 'Photography',
    popularity: 97,
    createdAt: '2026-04-01',
    thumbnail:
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 5,
    title: 'Botanical Ink Series',
    description: 'Nature sketches drawn in archival ink with intricate detail.',
    tags: ['botanical', 'ink', 'nature'],
    category: 'Illustration',
    popularity: 81,
    createdAt: '2026-03-21',
    thumbnail:
      'https://images.unsplash.com/photo-1456086272160-b28b0645b729?auto=format&fit=crop&w=640&q=80',
  },
  {
    id: 6,
    title: 'Neon Geometry Study',
    description: 'Vibrant geometric composition balancing sharp edges and glow.',
    tags: ['abstract', 'geometry', 'neon'],
    category: 'Digital Art',
    popularity: 90,
    createdAt: '2026-04-14',
    thumbnail:
      'https://images.unsplash.com/photo-1515405295579-ba7b45403062?auto=format&fit=crop&w=640&q=80',
  },
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightMatch = (text, query) => {
  const safeQuery = query.trim();
  if (!safeQuery) {
    return text;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(safeQuery)})`, 'ig'));

  return parts.map((part, index) =>
    part.toLowerCase() === safeQuery.toLowerCase() ? (
      <mark key={`${part}-${index}`} className={styles.highlight}>
        {part}
      </mark>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    )
  );
};

const sortResults = (items, sortBy) => {
  const sorted = [...items];

  if (sortBy === 'az') {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }

  sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return sorted;
};

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cameraHint, setCameraHint] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const fileInputRef = useRef(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const normalizedDebouncedQuery = debouncedQuery.trim().toLowerCase();

  const indexedItems = useMemo(() => {
    return SEARCH_ITEMS.map((item) => ({
      ...item,
      searchableText: `${item.title} ${item.description} ${item.category} ${item.tags.join(' ')}`.toLowerCase(),
    }));
  }, []);

  const categories = useMemo(() => {
    return ['all', ...new Set(SEARCH_ITEMS.map((item) => item.category))];
  }, []);

  const tags = useMemo(() => {
    return ['all', ...new Set(SEARCH_ITEMS.flatMap((item) => item.tags))];
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 220);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const suggestions = useMemo(() => {
    if (!normalizedDebouncedQuery) {
      return [];
    }

    const tokens = [
      ...indexedItems.map((item) => item.title),
      ...indexedItems.flatMap((item) => item.tags),
      ...indexedItems.map((item) => item.category),
    ];

    return [...new Set(tokens)]
      .filter((token) => token.toLowerCase().includes(normalizedDebouncedQuery))
      .slice(0, 6);
  }, [indexedItems, normalizedDebouncedQuery]);

  useEffect(() => {
    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      const filtered = indexedItems.filter((item) => {
        const inSearch =
          !normalizedDebouncedQuery || item.searchableText.includes(normalizedDebouncedQuery);

        const inCategoryFilter =
          selectedCategory === 'all' || item.category === selectedCategory;
        const inTagFilter = selectedTag === 'all' || item.tags.includes(selectedTag);

        return inSearch && inCategoryFilter && inTagFilter;
      });

      setResults(sortResults(filtered, sortBy));
      setIsLoading(false);
    }, 320);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [indexedItems, normalizedDebouncedQuery, selectedCategory, selectedTag, sortBy]);

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
    setShowSuggestions(false);
    setCameraHint(`Image selected: ${selectedFile.name}`);
  };

  const resultSummary = searchQuery.trim()
    ? `${results.length} results found for "${searchQuery.trim()}"`
    : `${results.length} results found`;

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedTag('all');
    setSortBy('latest');
  };

  return (
    <div className={styles.pageShell}>
      <header className={styles.headerWrap}>
        <div className={styles.topRow}>
          <h1 className={styles.brandTitle}>zigguratss</h1>

          <div className={styles.searchSurface}>
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
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  window.setTimeout(() => setShowSuggestions(false), 120);
                }}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setShowSuggestions(true);
                  if (cameraHint) {
                    setCameraHint('');
                  }
                }}
                className={styles.searchInput}
                placeholder="Search title, descriptions, tags, categories"
                aria-label="Search artworks"
              />

              <input
                ref={fileInputRef}
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

            {showSuggestions && suggestions.length > 0 && (
              <ul className={styles.suggestions}>
                {suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      className={styles.suggestionButton}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            )}
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

      <main className={styles.resultsSection} aria-label="Search results">
        <section className={styles.controlPanel}>
          <div className={styles.summaryRow}>
            <p className={styles.resultCount}>{resultSummary}</p>
            <button type="button" className={styles.clearButton} onClick={clearFilters}>
              Clear filters
            </button>
          </div>

          <div className={styles.controlRow}>
            <label className={styles.controlLabel}>
              Category
              <select
                className={styles.controlInput}
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All categories' : category}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.controlLabel}>
              Tag
              <select
                className={styles.controlInput}
                value={selectedTag}
                onChange={(event) => setSelectedTag(event.target.value)}
              >
                {tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag === 'all' ? 'All tags' : tag}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.controlLabel}>
              Sort by
              <select
                className={styles.controlInput}
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="latest">Latest</option>
                <option value="az">A-Z</option>
              </select>
            </label>
          </div>
        </section>

        {isLoading ? (
          <ul className={styles.resultsList} aria-label="Loading search results">
            {Array.from({ length: 6 }).map((_, index) => (
              <li key={`skeleton-${index}`} className={styles.skeletonCard}>
                <div className={`${styles.skeleton} ${styles.skeletonImage}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonBadge}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonLine}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonLineShort}`}></div>
              </li>
            ))}
          </ul>
        ) : results.length === 0 ? (
          <div className={styles.noResults}>
            <p className={styles.noResultsTitle}>No results found</p>
            <p className={styles.noResultsText}>Try one of these suggestions:</p>
            <ul className={styles.noResultsList}>
              <li>Use a broader keyword such as art, photo, or print.</li>
              <li>Clear category and tag filters to widen your search.</li>
              <li>Check for spelling or try a shorter term.</li>
            </ul>
            <button type="button" className={styles.noResultsAction} onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          <ul
            className={`${styles.resultsList} ${
              results.length === 1 ? styles.singleResultList : ''
            }`}
          >
            {results.map((item) => (
              <li key={item.id} className={styles.resultCard}>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className={styles.resultImage}
                  loading="lazy"
                />

                <div className={styles.resultContent}>
                  <p className={styles.resultCategoryBadge}>{item.category}</p>
                  <h2 className={styles.resultTitle}>{highlightMatch(item.title, normalizedQuery)}</h2>
                  <p className={styles.resultDescription}>
                    {highlightMatch(item.description, normalizedQuery)}
                  </p>
                  <div className={styles.tagWrap}>
                    {item.tags.map((tag) => (
                      <span key={`${item.id}-${tag}`} className={styles.tagChip}>
                        #{highlightMatch(tag, normalizedQuery)}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default Search;
