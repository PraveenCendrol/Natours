class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFeilds = ['page', 'sort', 'limit', 'fields'];

    excludedFeilds.forEach(e => delete queryObj[e]);
    const queryStr = JSON.stringify(queryObj);
    const updatedStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, e => `$${e}`);
    const parsedString = JSON.parse(updatedStr);
    // advance fileterinf
    this.query = this.query.find(parsedString);
    // let query = Tour.find(parsedString);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
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
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = APIFeatures;
