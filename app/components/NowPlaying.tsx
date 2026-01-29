"use client";

export default function NowPlaying() {
  return (
    <div className="main">
      {/* Header */}
      <div className="currentplaying">
        <svg
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
          className="spotify"
        >
          <circle cx="32" cy="32" r="25" fill="#1db954" />
          <path
            d="M41.6 44.4c-.4 0-.7-.2-1.1-.4-3.5-2-7.7-3.1-12.2-3.1-2.6 0-5.1.4-7.5.9-.4 0-.9.2-1.1.2-.9 0-1.5-.7-1.5-1.5 0-.9.5-1.5 1.3-1.6 2.9-.7 5.8-1.1 9-1.1 5.1 0 9.9 1.3 13.9 3.7.5.3.9.7.9 1.6 0 .7-.7 1.4-1.4 1.4z"
            fill="#fff"
          />
        </svg>

        <p className="heading">MATH LEVELE</p>
      </div>

      {/* Song 1 */}
      <div className="loader">
        <div className="song">
          <p className="name">Default </p>
          <p className="artist">E * EVERYONE</p>
        </div>
        <div className="albumcover" />
        <div className="loading">
          <span className="load" />
          <span className="load" />
          <span className="load" />
          <span className="load" />
        </div>
      </div>

      {/* Song 2 */}
      <div className="loader">
        <div className="song">
          <p className="name">AP PRECALCULUS</p>
          <p className="artist">MODERATE DIFFICULTY</p>
        </div>
        <div className="albumcover" />
        <div className="play" />
      </div>

      {/* Song 3 */}
      <div className="loader">
        <div className="song">
          <p className="name">AP Calculus AB </p>
          <p className="artist">HARDEST LEVEL </p>
        </div>
        <div className="albumcover" />
        <div className="play" />
      </div>
    </div>
  );
}
