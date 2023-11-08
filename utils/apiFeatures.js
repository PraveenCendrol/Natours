class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // delete unwanted fields
    const queryObj = { ...this.queryString };
    const excludedFeilds = ['page', 'sort', 'limit', 'fields'];

    excludedFeilds.forEach(e => delete queryObj[e]);

    // convert query to mongoose string
    const queryStr = JSON.stringify(queryObj);
    const updatedStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, e => `$${e}`);
    const parsedString = JSON.parse(updatedStr);

    // find based on parsedString
    this.query = this.query.find(parsedString);

    return this;
  }

  sort() {
    // sort query results
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // select fields
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      console.log('>>>>>>>>>>>>>>', fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    // paginate query results
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
