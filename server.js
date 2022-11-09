/*!
 * AllOrigins
 * written by Gabriel Nunes <gabriel@multiverso.me>
 * http://github.com/gnuns
 */

import app from './app.js';

const port = process.env.PORT || 80

console.log(`Starting noCors v${global.AO_VERSION}`)
app.listen(port, () => console.log('Listening on', port))
