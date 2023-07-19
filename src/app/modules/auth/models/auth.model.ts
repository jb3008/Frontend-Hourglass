export class AuthModel {
  token: string;
  'user-id': string;
  vendorId: string;
  setAuth(auth: AuthModel) {
    this.token = auth.token;
    this['user-id'] = auth['user-id'];
    this.vendorId = auth.vendorId;
  }
}
