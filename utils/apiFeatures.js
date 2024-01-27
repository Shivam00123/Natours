class APIFeatures {
  constructor(queryObject, model) {
    this.queryObject = queryObject;
    this.model = model;
  }
  filter() {
    const objectCopy = { ...this.queryObject };
    const excludeFields = ["page", "sort", "limit", "fields", "role"];
    excludeFields.forEach((el) => delete objectCopy[el]);
    let queryObjectToString = JSON.stringify(objectCopy);
    queryObjectToString = queryObjectToString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );
    this.model = this.model.find(JSON.parse(queryObjectToString));
    return this;
  }
  sort() {
    if (this.queryObject.sort) {
      const sortObject = this.queryObject.sort.split(",").join(" ");
      this.model = this.model.sort(sortObject);
    } else {
      this.model = this.model.sort("-createdAt");
    }
    return this;
  }
  limiting() {
    if (this.queryObject.fields) {
      const fieldsObject = this.queryObject.fields.split(",").join(" ");
      this.model = this.model.select(fieldsObject);
    } else {
      this.model = this.model.select("-__v");
    }
    return this;
  }
  paginate() {
    const page = this.queryObject.page * 1 || 1;
    const limit = this.queryObject.limit * 1 || 10;
    const skipDocs = (page - 1) * limit;
    this.model = this.model.skip(skipDocs).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
