const helpers = {
  /**
   *
   * @param {number} _ -
   * @returns {string}
   */
  makeid: (_) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    while (result.length < _) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  },

  /**
   *
   * @param {array} theArray - array of objects with or without change property.
   * @param {object} notThisOne - Optional, to skip a result, to avoid repeating options.
   * @returns {object}
   */
  getByChance: (theArray, notThisOne) => {
    if (typeof notThisOne === 'undefined') notThisOne = {};

    // if chance not set in the json then all are equal
    if (!theArray[0].chance) theArray = theArray.map((_) => ({ ..._, chance: 100 / theArray.length, }));

    let i = -1;
    theArray[-1] = {};
    while (JSON.stringify(theArray[i] === JSON.stringify(notThisOne))) {
      const randomPercent = Math.floor(Math.random() * 100) + 1;
      let sumChance = 0;
      for (i = 0; i < theArray.length; i++) {
        sumChance += theArray[i].chance;
        if (sumChance > randomPercent) return theArray[i];
      }
    }
    return theArray[i];
  },

  /**
   * To avoid getting repeated elements;
   * @param {array} theArray -
   * @param {number} howManyElements -
   * @returns {array} - array of arrays.
   */
  arrayByChance: (theArray, howManyElements) => {
    if (!howManyElements) throw new Error('[helpers.arrayByChance] missing param "howManyElements"');

    const manyByChance = [];
    if (!theArray[0].chance) theArray = theArray.map((_) => ({ ..._, chance: 100 / theArray.length, }));
    for (let r = 0; r < howManyElements; r++) {
      let byChance = helpers.getByChance(theArray);
      while(manyByChance.map((_) => JSON.stringify(_)).includes(JSON.stringify(byChance))) {
        byChance = helpers.getByChance(theArray);
      }
      manyByChance.push(byChance);
    }
    return manyByChance;
  },

  /**
   * @param {array} theArray -
   * @returns {array}
   */
  shuffleArray: (theArray) => {
    let currentIndex = theArray.length;
    let randomIndex;
    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [theArray[currentIndex], theArray[randomIndex]] = [theArray[randomIndex], theArray[currentIndex]];
    }
    return theArray;
  },
};

export { helpers };
