export default class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    Quaternion.prototype["isQuaternion"] = true;
  }
}
