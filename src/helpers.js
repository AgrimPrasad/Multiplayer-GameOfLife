/**
 * helper function for POST calls
 *
 * @param {string} path - full path to call
 * @param {object} body - body object to send, will be JSON stringified before being sent
 */
export const sendPOST = function(path, body) {
  fetch(path, {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .then(data => {
      const dataErr = data.error;
      if (dataErr) {
        /* eslint-disable-next-line no-console */
        console.error(
          dataErr,
          "POST returned error in data for endpoint",
          path
        );
      }
    })
    /* eslint-disable-next-line no-console */
    .catch(error => console.error(error, "POST failed for endpoint", path));
};
