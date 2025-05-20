const adjectives = ["Curious", "Quiet", "Witty", "Shy", "Bold", "Kind"];
const animals = ["Fox", "Tiger", "Bear", "Hawk", "Panda", "Dolphin"];

function generateAlias() {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `Anonymous ${adjective} ${animal}`;
}

module.exports = generateAlias;
