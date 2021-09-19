import HydycoModel from "../model";
import { Model, Document } from "mongoose";

export default class Routes {
  private _model: HydycoModel;
  private _mongooseModel: Model<Document<any, any>>;

  constructor(private modelName) {
    this._model = new HydycoModel(modelName);
    this._mongooseModel = this._model.Model();
    this.findByIdAndUpdate = this._mongooseModel.findByIdAndUpdate;
    this.remove = this._mongooseModel.remove;
  }

  public getModel() {
    return this._model.Model();
  }

  public raw() {
    return this._model.mapping();
  }

  public find(query = {}) {
    return this._mongooseModel.find(query);
  }

  public create(body = {}) {
    return this._mongooseModel.create(body);
  }

  public findById(id) {
    return this._mongooseModel.findById(id);
  }

  public findByIdAndUpdate(id, body) {
    return this._mongooseModel.findByIdAndUpdate(id, body);
  }

  public findByIdAndDelete(id) {
    return this._mongooseModel.findByIdAndDelete(id);
  }

  public remove() {
    return this._mongooseModel.remove({});
  }
}
