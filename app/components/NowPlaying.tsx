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
  {/* Background */}
  <circle cx="32" cy="32" r="25" fill="#2563eb" />

  {/* Plus */}
  <rect x="30" y="18" width="4" height="28" fill="#fff" />
  <rect x="18" y="30" width="28" height="4" fill="#fff" />

  {/* Minus */}
  <rect x="18" y="46" width="12" height="3" fill="#fff" />

  {/* Multiply (x) */}
  <rect
    x="38"
    y="41"
    width="3"
    height="12"
    fill="#fff"
    transform="rotate(45 38 41)"
  />
  <rect
    x="38"
    y="41"
    width="3"
    height="12"
    fill="#fff"
    transform="rotate(-45 38 41)"
  />
</svg>

      

        <p className="heading">MATH LEVELS</p>
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
