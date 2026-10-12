console.log("BELWARP JS loaded");

console.log(
  "Decks found:",
  document.querySelectorAll("[data-deck]").length
);

document.querySelectorAll("[data-deck]").forEach(initDeck);

function initDeck(deck) {
  const stage = deck.querySelector(".artist-deck__stage");
  const cards = [...deck.querySelectorAll("[data-card]")];

  if (!stage || !cards.length) return;
  const leadIn = 0.4;
  const leadOut = 0.5;
  deck.style.height =
    `${(cards.length + leadIn + leadOut + 1) * 100}vh`;
  if (!stage || !cards.length) return;

  /*
   * One viewport-ish worth of scrolling per card,
   * plus the sticky viewport itself.
   */
  deck.style.height = `${(cards.length + 1) * 100}vh`;

  const clamp = (value, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value));

  const easeOut = t => {
    t = clamp(t);
    return 1 - Math.pow(1 - t, 3);
  };

  const easeInOut = t => {
    t = clamp(t);
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const mix = (from, to, amount) =>
    from + (to - from) * amount;


  function render() {
    const rect = deck.getBoundingClientRect();
    const scrollDistance =
      deck.offsetHeight - window.innerHeight;
    const scrolled = clamp(
      -rect.top / scrollDistance
    );
    const totalUnits =
      leadIn + cards.length + leadOut;
    const timeline =
      scrolled * totalUnits;
    const journey = clamp(
      timeline - leadIn,
      0,
      cards.length
    );

    cards.forEach((card, index) => {

      /*
       * 0 → 1 represents this card's complete deal.
       *
       * < 0 = hasn't started
       * > 1 = already played
       */
      const p = clamp(journey - index);


      let x;
      let y;
      let scale;
      let rotation;


      /*
       * PHASE 1
       * Bottom → centre
       */
      if (p < 0.30) {
        const t = easeOut(p / 0.30);

        x = mix(
          deckX(index, cards.length),
          0,
          t
        );

        y = mix(
          window.innerHeight * 0.42,
          0,
          t
        );

        scale = mix(
          0.30,
          1,
          t
        );

        rotation = mix(
          deckRotation(index),
          0,
          t
        );
      }


      /*
       * PHASE 2
       * Hold for reading
       */
      else if (p < 0.68) {
        x = 0;
        y = 0;
        scale = 1;
        rotation = 0;
      }


      /*
       * PHASE 3
       * Centre → hand
       */
      else {
        const t = easeInOut(
          (p - 0.68) / 0.32
        );

        x = mix(
          0,
          handX(index, cards.length),
          t
        );

        y = mix(
          0,
          -window.innerHeight * 0.40,
          t
        );

        scale = mix(
          1,
          0.30,
          t
        );

        rotation = mix(
          0,
          handRotation(index),
          t
        );
      }

      /*
       * translate(-50%, -50%) makes left/top 50%
       * represent the card's centre.
       */
      card.style.transform = `
            translate(-50%, -50%)
            translate(${x}px, ${y}px)
            scale(${scale})
            rotate(${rotation}deg)
          `;

      /*
       * Active/newer cards sit above old ones.
       */
      card.style.zIndex =
        String(index + 1);
    });
  }


  /*
   * Horizontal positions of cards waiting
   * at the bottom.
   */
  function deckX(index, count) {
    const spacing = Math.min(
      window.innerWidth * 0.16,
      140
    );

    return (
      index - (count - 1) / 2
    ) * spacing;
  }


  /*
   * Horizontal positions in completed hand.
   */
  function handX(index, count) {
    const spacing = Math.min(
      window.innerWidth * 0.16,
      140
    );

    return (
      index - (count - 1) / 2
    ) * spacing;
  }


  function deckRotation(index) {
    return (index % 2 ? 1 : -1) * 3;
  }


  function handRotation(index) {
    return (index % 2 ? 1 : -1) * 2;
  }


  let ticking = false;

  function requestRender() {
    if (ticking) return;

    ticking = true;

    requestAnimationFrame(() => {
      render();
      ticking = false;
    });
  }


  window.addEventListener(
    "scroll",
    requestRender,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestRender
  );

  render();
}
