/* @refresh reload */
import { render } from 'solid-js/web';
import App from '~/app';
import '~/styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found in index.html');

render(() => <App />, root);
