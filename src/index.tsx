/* @refresh reload */
import { defineCustomElements } from '@deadlock-api/ui-core/loader';
import { render } from 'solid-js/web';
import App from '~/app';
import '~/styles/global.css';

void defineCustomElements();

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found in index.html');

render(() => <App />, root);
