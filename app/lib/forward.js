/**
 * Ensures only approriate domains are processed by this tool
 * @param {string} host
 * @param {string} path
 * @returns {{error ?: string, destination: string}}
 */
module.exports = function go (host, path) {
  const rootdomain = host.match(/[^.]+(?:(?:[.](?:com|co|org|net|edu|gov)[.][^.]{2})|([.][^.]+))$/);
  const newURL = `http://www.${host}${path}`;
  console.warn(`${newURL} is currently an insecure URL; Please ensure an SSL is attached in the Provisioner.`);
  if (rootdomain[0] === host) {
    console.warn(`${newURL} is a same-domain redirect; This should be moved to the CMS Redirects Manager.`);
    return { destination: newURL };
  } else {
    return { error: 'No Redirect Destinations found for this requested domain.' };
  }
};
