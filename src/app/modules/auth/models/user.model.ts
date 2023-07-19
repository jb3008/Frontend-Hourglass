import { AuthModel } from './auth.model';
import { AddressModel } from './address.model';
import { SocialNetworksModel } from './social-networks.model';

export class UserModel extends AuthModel {
  id: number;
  userId: string;
  emailId: string;
  firstName: string;
  lastName: string;
  userRole: string;
  designation: string;
  contactNumber: string;
  companyCode: string;
  vendorId: string;
  permissionBits: number;
  managerId: string;
  permissions: any[] = [];

  setUser(_user: unknown) {
    const user = _user as UserModel;
    this.id = user.id;
    this.userId = user.userId;
    this.emailId = user.emailId;
    this.vendorId = user.vendorId;
  }
}
