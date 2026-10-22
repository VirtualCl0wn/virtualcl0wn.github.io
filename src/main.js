import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/dela-gothic-one'

import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { TextPlugin } from 'gsap/TextPlugin';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer, ScrambleTextPlugin, TextPlugin);
gsap.globalTimeline.timeScale(1.5);

const defaults = {
    duration: 0.6,
    ease: 'power2.out'
};

const heroReveal = gsap.timeline({ paused: true, defaults:defaults });
heroReveal.from('.hero', { scaleY: 0, duration: 0.9, ease: 'power4.inOut'}, '-=0.3');
heroReveal.from('.hero_kicker', { opacity: 0, scale: 0.8 }, '-=0.3');
heroReveal.from('.hero h1', { opacity: 0, y: 20 }, '-=0.2');
heroReveal.from('.hero_sub', { opacity: 0, y: 20 }, '-=0.3');

let animating = true;
const intro = gsap.timeline({ defaults: defaults});
const bootLines = gsap.utils.toArray('.boot_line');

bootLines.forEach((line) => { const text = line.textContent.trim(); line.textContent=''; intro.to(line, { duration: 0.7, scrambleText: { text: text, chars: 'upperCase' } }, '<0.4' ) } );
intro.to('.boot', { opacity: 0, duration: 0.4 }, '+=0.5');
intro.set('.boot', { display: 'none' });
intro.call(() => animating = false);


intro.set( ['.hero', '.hud'], { visibility: 'visible' });
intro.from('.hud', { opacity: 0 });
intro.add(heroReveal.tweenFromTo(0, heroReveal.duration()));
intro.to('.weave', { opacity: 1, duration: 1.5 });

const panels = gsap.utils.toArray('section.panel');

const reveals = [heroReveal];

panels.forEach((panel) => { 
    const heading = panel.querySelector('h2');
    const content = panel.querySelectorAll(':scope > p,:scope > ul, .card, .profile, .dialogue');
    const headingText = heading.textContent.trim();
    heading.textContent = "";

    const subtitle = panel.querySelector('.subtitle');

    let subtitleText = '';

    if(subtitle) {
        subtitleText = subtitle.textContent.trim();
        subtitle.textContent = '';
    }

    const reveal = gsap.timeline({ paused: true });

    reveal.from(panel, { scaleY: 0, duration: 0.8, ease: 'power4.inOut' });
    reveal.to(heading, { duration: 1, scrambleText: { text: headingText, chars: 'upperCase', speed: 0.4 } }, '-=0.2' );
    reveal.from(content, { opacity: 0, y: 20, duration: 0.5, stagger: 0.1, }, '<0.3');

    if(subtitle) {
        reveal.to(subtitle, { duration: 2, text: subtitleText, ease: 'none' }, '>0.2');
    }

    reveals.push(reveal);
});

const stages = gsap.utils.toArray('.stage');
let current = 0;
let swap;
gsap.set(stages[0], { visibility: 'visible' });

function goTo(index) {
    if(animating || index < 0 || index > stages.length - 1 || index == current)
    {
        return;
    }

    if(intro.isActive()) {
        intro.progress(1);
    }

    if(swap){
        swap.kill();
    }

    animating = true;
    const outgoing = reveals[current];
    const incoming = reveals[index];
    const fromStage = stages[current];
    const toStage = stages[index];

    swap = gsap.timeline();
    swap.add(outgoing.tweenTo(0, { duration: 0.6 }));
    swap.set(fromStage, { visibility: 'hidden' });
    swap.set(toStage, { visibility: 'visible' });
    swap.call(() => animating = false);
    swap.add(incoming.tweenFromTo(0, incoming.duration()));

    setStatus(toStage.firstElementChild.dataset.status);
    gsap.utils.toArray('.hud_nav a').forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === '#' + toStage.id));
    current = index;

}

const readout = document.querySelector('[data-readout]')

function setStatus(message) {
    gsap.to(readout, { duration: 0.6, scrambleText: { text: message, chars: 'upperCase' }, overwrite: true } );
}

Observer.create({ type: 'wheel,touch', wheelSpeed: -1, onUp: () => goTo(current + 1), onDown: () => goTo(current - 1), tolerance: 10, preventDefault: true });


window.addEventListener('keydown', (Event) => { 
    if(Event.key == 'ArrowDown' || Event.key == 'PageDown'){
    goTo(current + 1);
    }

    if(Event.key == 'ArrowUp' || Event.key == 'PageUp'){
        goTo(current - 1);
    } 
} )

gsap.utils.toArray('.hud_nav a').forEach((link) => { 
    link.addEventListener('click', (Event) => { 
        Event.preventDefault();
        const target = stages.findIndex((stage) => { 
            return '#' + stage.id == link.getAttribute('href')});
        goTo(target);
    });
 });