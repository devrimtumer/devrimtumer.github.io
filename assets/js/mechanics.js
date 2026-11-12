/*
 * Continuum kinematics — a dependency-free SVG illustration.
 *
 * Markup: [data-mechanics] contains [data-mechanics-stage] and an optional
 * [data-mechanics-fallback] image. data-mode="tension" (default) or "shear".
 * Controls, scoped to that same parent, are optional:
 *   input[data-stretch]         range 80..125, step 1 (lambda × 100)
 *   input[data-shear]           range -35..35, step 1 (gamma × 100)
 *   [data-stretch-value], [data-shear-value], [data-jacobian]
 *   [data-f11], [data-f12], [data-f22], [data-f33]
 *   button[data-mode-button="tension"|"shear"]
 *   button[data-motion]         toggles a slow, user-initiated deformation
 *   [data-tension-controls], [data-shear-controls] (optional mode panels)
 *
 * Initial lambda is 1.10; initial gamma is 0.20. Input values override these.
 * Both affine maps preserve volume exactly: det(F) = 1.
 * Fibres illustrate material directions; this is not a finite-element result.
 * No content, controls, or library is required outside the enclosing element.
 */
(() => {
  'use strict';

  const PAPER = '#f4f2eb';
  const INK = '#35464a';
  const RUST = '#aa5437';
  const SCALE = 250;
  const f = n => Number(n).toFixed(2);
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  function illustration(mode, lambda, gamma) {
    const lateral = 1 / Math.sqrt(lambda);
    const transform = ([x, y, z]) => mode === 'shear'
      ? [x + gamma * y, y, z]
      : [lateral * x, lambda * y, lateral * z];
    const project = p => {
      const [x, y, z] = transform(p);
      return [300 + SCALE * (.94 * x - .62 * z), 260 + SCALE * (-.96 * y + .20 * x + .31 * z)];
    };
    const point = p => project(p).map(f).join(',');
    const path = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${point(p)}`).join(' ');
    const line = (a, b) => `<path d="${path([a, b])}"/>`;
    const face = (pts, opacity) => `<path d="${path(pts)} Z" fill="${PAPER}" fill-opacity="${opacity}" stroke="none"/>`;
    const parts = [];

    parts.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 540" width="600" height="540" role="img" aria-label="Three-dimensional illustration of a deforming fibre-reinforced material element" class="mechanics-svg" style="display:block;width:100%;height:auto;overflow:visible">');
    parts.push('<title>Volume-preserving continuum deformation</title>');
    parts.push('<desc>A material element with a fine surface mesh and longitudinal fibres. The geometry follows an exact affine deformation. This is a kinematic illustration, not experimental data or a finite-element analysis.</desc>');

    // Sparse drafting marks frame the composition without a decorative box.
    parts.push(`<g fill="none" stroke="${INK}" stroke-width=".6" opacity=".17"><path d="M54 80 V54 H80 M520 54 H546 V80 M54 460 V486 H80 M520 486 H546 V460"/><path d="M292 28 H308 M300 20 V36 M292 512 H308 M300 504 V520"/></g>`);

    // Rear faces are intentionally faint: the visible block remains readable.
    parts.push(`<g fill="none" stroke="${INK}" stroke-width=".65" opacity=".17" stroke-linecap="round" stroke-linejoin="round">`);
    for (let i = 0; i <= 12; i++) {
      const q = -.5 + i / 12;
      parts.push(line([-.5, -.5, q], [.5, -.5, q]));
      parts.push(line([q, -.5, -.5], [q, -.5, .5]));
      parts.push(line([-.5, q, -.5], [.5, q, -.5]));
      parts.push(line([q, -.5, -.5], [q, .5, -.5]));
      parts.push(line([-.5, q, -.5], [-.5, q, .5]));
      parts.push(line([-.5, -.5, q], [-.5, .5, q]));
    }
    parts.push('</g>');

    // Three lightly tinted surfaces, ordered back to front.
    parts.push(face([[-.5, .5, -.5], [.5, .5, -.5], [.5, .5, .5], [-.5, .5, .5]], '.28'));
    parts.push(face([[.5, -.5, -.5], [.5, -.5, .5], [.5, .5, .5], [.5, .5, -.5]], '.30'));
    parts.push(face([[-.5, -.5, .5], [.5, -.5, .5], [.5, .5, .5], [-.5, .5, .5]], '.16'));

    // Interior fibre paths have a small initial crimp; F acts on every point.
    // No changing frequency or unphysical screen-space deformation is used.
    for (let layer = 0; layer < 3; layer++) {
      const z0 = -.28 + layer * .27;
      parts.push(`<g fill="none" stroke="${RUST}" stroke-width="${layer === 2 ? '1.65' : '1.15'}" opacity="${[.25, .47, .78][layer]}" stroke-linecap="round">`);
      for (let strand = 0; strand < 6; strand++) {
        const x0 = -.34 + strand * .136;
        const phase = strand * .43 + layer * .9;
        const pts = [];
        for (let j = 0; j <= 72; j++) {
          const y = -.5 + j / 72;
          const taper = Math.sin(Math.PI * (y + .5));
          pts.push([x0 + .013 * Math.sin(5 * Math.PI * (y + .5) + phase) * taper, y, z0 + .009 * Math.cos(5 * Math.PI * (y + .5) + phase) * taper]);
        }
        parts.push(`<path d="${path(pts)}"/>`);
      }
      parts.push('</g>');
    }

    // Visible faces form a regular material mesh, not a stress contour plot.
    parts.push(`<g fill="none" stroke="${INK}" stroke-width=".65" opacity=".38" stroke-linecap="round" stroke-linejoin="round">`);
    for (let i = 0; i <= 12; i++) {
      const q = -.5 + i / 12;
      parts.push(line([q, .5, -.5], [q, .5, .5]));
      parts.push(line([-.5, .5, q], [.5, .5, q]));
      parts.push(line([.5, q, -.5], [.5, q, .5]));
      parts.push(line([.5, -.5, q], [.5, .5, q]));
      parts.push(line([q, -.5, .5], [q, .5, .5]));
      parts.push(line([-.5, q, .5], [.5, q, .5]));
    }
    parts.push('</g>');

    // Nine exposed edges are distinct from the finer face grid.
    parts.push(`<g fill="none" stroke="${INK}" stroke-width="1.05" opacity=".65" stroke-linecap="round" stroke-linejoin="round">`);
    for (const y of [-.5, .5]) {
      parts.push(line([-.5, y, .5], [.5, y, .5]));
      parts.push(line([.5, y, -.5], [.5, y, .5]));
    }
    parts.push(line([-.5, .5, -.5], [.5, .5, -.5]));
    parts.push(line([-.5, .5, -.5], [-.5, .5, .5]));
    parts.push(line([-.5, -.5, .5], [-.5, .5, .5]));
    parts.push(line([.5, -.5, .5], [.5, .5, .5]));
    parts.push(line([.5, -.5, -.5], [.5, .5, -.5]));
    parts.push('</g>');

    // Surface nodes establish the discretisation quietly at the outer boundary.
    parts.push(`<g fill="${INK}" opacity=".55">`);
    for (const [x, y, z] of [[-.5, .5, -.5], [.5, .5, -.5], [-.5, .5, .5], [.5, .5, .5], [-.5, -.5, .5], [.5, -.5, .5], [.5, -.5, -.5]]) {
      const [px, py] = project([x, y, z]);
      parts.push(`<circle cx="${f(px)}" cy="${f(py)}" r="2.0"/>`);
    }
    parts.push('</g>');

    // Fixed spatial basis (not a moving material triad).
    parts.push(`<g transform="translate(90 440)" fill="none" stroke="${INK}" stroke-width=".85" opacity=".62"><path d="M0 0 L35 7 M35 7 L29 3 M35 7 L28 9 M0 0 V-34 M0-34 L-3-28 M0-34 L3-28 M0 0 L-24 12 M-24 12 L-17 12 M-24 12 L-20 6"/><circle cx="0" cy="0" r="1.8" fill="${INK}" stroke="none"/></g>`);
    parts.push(`<g fill="${INK}" opacity=".75" font-family="Georgia, serif" font-size="12" font-style="italic"><text x="132" y="453">x₁</text><text x="83" y="396">x₂</text><text x="46" y="460">x₃</text></g>`);
    parts.push('</svg>');
    return parts.join('');
  }

  function enhance(root) {
    const stage = root.querySelector('[data-mechanics-stage]');
    if (!stage) return;
    const fallback = root.querySelector('[data-mechanics-fallback]');
    const stretchInput = root.querySelector('input[data-stretch]');
    const shearInput = root.querySelector('input[data-shear]');
    const motionButton = root.querySelector('button[data-motion]');
    const modeButtons = root.querySelectorAll('button[data-mode-button], button[data-mode]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const readInput = (input, defaultValue, min, max) => {
      const value = input ? Number(input.value) / 100 : defaultValue;
      return Number.isFinite(value) ? clamp(value, min, max) : defaultValue;
    };
    let mode = root.dataset.mode === 'shear' ? 'shear' : 'tension';
    let lambda = readInput(stretchInput, 1.10, .8, 1.25);
    let gamma = readInput(shearInput, .20, -.35, .35);
    let playing = false;
    let visible = true;
    let request = 0;
    let lastFrame = 0;
    let phase = 0;

    function setText(selector, value) {
      root.querySelectorAll(selector).forEach(node => { node.textContent = value; });
    }

    function render() {
      stage.innerHTML = illustration(mode, lambda, gamma);
      if (fallback) fallback.hidden = true;
      root.classList.add('mechanics-ready');
      setText('[data-stretch-value]', lambda.toFixed(2));
      setText('[data-shear-value]', gamma.toFixed(2));
      if (stretchInput) stretchInput.setAttribute('aria-valuetext', `Stretch ratio ${lambda.toFixed(2)}`);
      if (shearInput) shearInput.setAttribute('aria-valuetext', `Shear parameter ${gamma.toFixed(2)}`);
      setText('[data-jacobian]', '1.000');
      setText('[data-f11], [data-f33]', mode === 'shear' ? '1.000' : (1 / Math.sqrt(lambda)).toFixed(3));
      setText('[data-f12]', mode === 'shear' ? gamma.toFixed(3) : '0');
      setText('[data-f22]', mode === 'shear' ? '1.000' : lambda.toFixed(3));
      modeButtons.forEach(button => button.setAttribute('aria-pressed', String((button.dataset.modeButton || button.dataset.mode) === mode)));
      root.querySelectorAll('[data-tension-controls]').forEach(node => { node.hidden = mode !== 'tension'; });
      root.querySelectorAll('[data-shear-controls]').forEach(node => { node.hidden = mode !== 'shear'; });
    }

    function stop() {
      playing = false;
      if (request) window.cancelAnimationFrame(request);
      request = 0;
      lastFrame = 0;
      if (motionButton) {
        motionButton.setAttribute('aria-pressed', 'false');
        motionButton.setAttribute('aria-label', 'Animate the material element');
        const label = motionButton.querySelector('[data-motion-label]');
        if (label) label.textContent = 'Animate';
      }
    }

    function frame(time) {
      if (!playing || !visible || document.hidden || reducedMotion.matches) { stop(); return; }
      if (!lastFrame) lastFrame = time;
      const delta = time - lastFrame;
      if (delta >= 1000 / 30) {
        phase += Math.min(delta, 100) * .00045;
        lastFrame = time;
        if (mode === 'shear') {
          gamma = .25 * Math.sin(phase);
          if (shearInput) shearInput.value = String(Math.round(gamma * 100));
        } else {
          lambda = 1.025 + .175 * Math.sin(phase);
          if (stretchInput) stretchInput.value = String(Math.round(lambda * 100));
        }
        render();
      }
      request = window.requestAnimationFrame(frame);
    }

    if (stretchInput) stretchInput.addEventListener('input', () => {
      stop();
      lambda = readInput(stretchInput, 1.10, .8, 1.25);
      render();
    });
    if (shearInput) shearInput.addEventListener('input', () => {
      stop();
      gamma = readInput(shearInput, .20, -.35, .35);
      render();
    });
    modeButtons.forEach(button => button.addEventListener('click', () => {
      stop();
      mode = (button.dataset.modeButton || button.dataset.mode) === 'shear' ? 'shear' : 'tension';
      root.dataset.mode = mode;
      render();
    }));

    if (motionButton) {
      motionButton.setAttribute('aria-pressed', 'false');
      motionButton.addEventListener('click', () => {
        if (playing) { stop(); return; }
        if (reducedMotion.matches) return;
        playing = true;
        phase = mode === 'shear' ? Math.asin(clamp(gamma / .25, -1, 1)) : Math.asin(clamp((lambda - 1.025) / .175, -1, 1));
        motionButton.setAttribute('aria-pressed', 'true');
        motionButton.setAttribute('aria-label', 'Pause the material animation');
        const label = motionButton.querySelector('[data-motion-label]');
        if (label) label.textContent = 'Pause';
        request = window.requestAnimationFrame(frame);
      });
      const respectMotion = () => {
        if (reducedMotion.matches) stop();
        motionButton.disabled = reducedMotion.matches;
        motionButton.title = reducedMotion.matches ? 'Animation is disabled by your reduced-motion preference. The sliders remain available.' : '';
      };
      respectMotion();
      if (typeof reducedMotion.addEventListener === 'function') reducedMotion.addEventListener('change', respectMotion);
    }

    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (!visible) stop();
      }, { threshold: .03 });
      observer.observe(root);
    }

    render();
  }

  document.querySelectorAll('[data-mechanics]').forEach(enhance);
})();
