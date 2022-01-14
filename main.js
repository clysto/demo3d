import 'normalize.css';
import './style.css';
import 'xterm/css/xterm.css';
import Zdog from 'zdog';
import { Terminal } from 'xterm';

let socket = null;
document.querySelector('#address').value =
  localStorage.getItem('demo3dServerDddress') || '';

const currentPosition = [-0.15, 0.15, 0];
const term = new Terminal({
  fontFamily: 'monospace',
  rows: 30,
  convertEol: true,
  scrollback: 99999,
  theme: {
    background: '#13181a',
  },
});
term.open(document.querySelector('#terminal'));
term.writeln('press START button!');

let illo = new Zdog.Illustration({
  element: '#zdog-canvas',
});

new Zdog.Box({
  addTo: illo,
  width: 300,
  height: 20,
  depth: 300,
  stroke: false,
  color: '#C25',
  leftFace: '#EA0',
  rightFace: '#E62',
  topFace: '#ED0',
  bottomFace: '#636',
});

function animate() {
  illo.rotate.x = 0;
  illo.rotate.y = 0;
  illo.rotate.z = 0;
  illo.rotate.x = -currentPosition[0];
  illo.rotate.z = -currentPosition[1];
  illo.updateRenderGraph();
  requestAnimationFrame(animate);
}

document.querySelector('#address').addEventListener('change', (event) => {
  localStorage.setItem('demo3dServerDddress', event.target.value);
});

document.querySelector('#start').addEventListener('click', () => {
  socket = new WebSocket(document.querySelector('#address').value);

  socket.addEventListener('error', () => {
    term.writeln('\x1B[31mWebSocket error!');
  });

  socket.addEventListener('message', ({ data }) => {
    const x = parseInt(data.slice(8, 16), 2);
    const y = parseInt(data.slice(16, 24), 2);
    const z = parseInt(data.slice(24, 32), 2);
    const log = {
      timestamp: +new Date(),
      raw: data,
      x,
      y,
      z,
    };
    term.writeln(JSON.stringify(log, null, 2));
    if (data.slice(0, 8) === '10110011') {
      currentPosition[0] = (x / 256) * Zdog.TAU;
      currentPosition[1] = (y / 256) * Zdog.TAU;
      currentPosition[2] = (z / 256) * Zdog.TAU;
    }
  });
});

animate();
