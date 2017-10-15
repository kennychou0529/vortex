import { observable } from 'mobx';

export default class User {
  @observable public isLoggedIn: boolean = undefined;
}
