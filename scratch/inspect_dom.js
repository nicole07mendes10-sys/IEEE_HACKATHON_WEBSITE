
const el = document.elementFromPoint(350, 800);
console.log('Element at 350,800:', el ? (el.tagName + '.' + el.className + '#' + el.id) : null);
const overlay = document.getElementById('miss-minutes-overlay');
console.log('Overlay rect:', overlay ? overlay.getBoundingClientRect() : null);
const vid = document.getElementById('miss-minutes-video');
console.log('Vid rect:', vid ? vid.getBoundingClientRect() : null);
console.log('Overlay computed background:', overlay ? window.getComputedStyle(overlay).background : null);
console.log('Vid computed background:', vid ? window.getComputedStyle(vid).background : null);
