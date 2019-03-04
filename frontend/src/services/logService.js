// basic log service. can change it out later for raven or something
function init() {}

function log(error) {
  console.error(error);
}

export default {
  init,
  log
};
