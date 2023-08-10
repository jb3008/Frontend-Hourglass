export class AuthModel {
  token: string;
  'user-id': string;
  vendorId: string;
  isAdmin: boolean;
  setAuth(auth: AuthModel) {
    this.token = auth.token;
    this['user-id'] = auth['user-id'];
    this.vendorId = auth.vendorId;

    this.isAdmin = auth.isAdmin;
  }
}
