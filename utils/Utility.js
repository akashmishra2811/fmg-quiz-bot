class Utility {
    static isEmpty = (value) => {
        if (value === null || value === undefined || value.length === 0)
          return true;
        if (Array.isArray(value) || typeof value === 'string') return !value.length;
        return Object.keys(value).length === 0;
      };
}

module.exports = {Utility}