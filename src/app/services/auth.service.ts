import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,  } from '@angular/common/http';
import { User } from '../models/user';
import { Sidenav } from 'materialize-css';
import { Image } from '../models/image';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { Address } from '../models/address';
import { LoaderService } from './loader.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly storageKey:string = 'id_token';
  readonly refreshKey:string = 'refresh-token';
  readonly rememberKey: string = 'rememberme';
  readonly userKey: string = 'user';
  
  baseUrl: string = environment.baseUrl;
  loginEndpoint: string = this.baseUrl + 'api/login_check';
  registerEndpoint: string = this.baseUrl + 'api/register';
  accountEndpoint: string = this.baseUrl + 'api/auth/me';
  cartEndpoint: string = this.baseUrl + 'api/auth/cart';

  readonly roles = {
    ROLE_CONSUMER: 'Consommateur',
    ROLE_OWNER: 'Partenaire',
    ROLE_ADMIN: 'Administrateur'
  }
  
  readonly genders = [
    { id: 1, name: "Homme" },
    { id: 2, name: "Femme" }
  ];

  /**
   * This variable comes from the '@0auth/angular-jwt' Module. 
   * It is used to check if the JWT token is expired.
   */
  private helper: JwtHelperService = new JwtHelperService();

  /**
   * This variable is used as a global variable to provide other components access.
   */
  user: User = null;
  
  /**
   * This variable is used as a global variable to provide access to other components.
   */
  cart: any;
  orderComplete: boolean = false;

  
  constructor(private http: HttpClient, private router: Router, private loader: LoaderService) {}


  getOwnerChartData() {
    return this.http.get(this.baseUrl + 'api/auth/owner/dashboard/data');
  }

  getOwnerData() {
    return this.http.get(this.baseUrl + 'api/auth/owner/dashboard');
  }

  /**
   * This function lets the user to make an order.
   * It receives an Object payload with the necessary information and sends it to the back-end with, 
   * an HTTP POST Request.
   * 
   * @param payload 
   */
  buy(payload: any) {
    payload.cartId = this.cart.id;
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.baseUrl + 'api/auth/cart/checkout', JSON.stringify(payload), { headers: headers });
  }

  /**
   * This function lets the user edit an address from his profile.
   * 
   * @param address 
   */
  editAddress(address: any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(this.baseUrl + 'api/auth/address/edit', JSON.stringify(address), { headers: headers });
  }

  /**
   * This function lets the user delete an address from his profile.
   * 
   * @param address 
   */
  deleteAddress(address: any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let params = new HttpParams().set('addressId', address.id);
    const options = {
      headers: headers,
      body: params
    };
    return this.http.delete(this.baseUrl+ 'api/auth/address/delete', options);
  }


/**
 * This function lets the user add an address to his profile.
 * 
 * @param address 
 */
  addAddress(address: Address) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.baseUrl+ 'api/auth/address/add', JSON.stringify(address), { headers: headers });
  }

  /**
   * This function lets the user edit his profile information.
   * 
   * @param user 
   */
  editUser(user: any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(this.baseUrl+ 'api/auth/me/edit', JSON.stringify(user), { headers: headers });
  }

  /**
   * This function lets the user upload a new profile image.
   * 
   * @param image 
   */
  uploadImage(image) {
    let data = new FormData();
    data.append('image', image, 'image');
    return this.http.post(this.baseUrl+ 'api/auth/image/add', data);
  }


  /**
   * This function lets the user delete his profile image.
   */
  deleteImage() {
    return this.http.delete(this.baseUrl+ 'api/auth/image/delete');
  }

  /**
   * This function is used to let the user change his password.
   * 
   * @param payload 
   */
  changePassword(payload: any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let params = new HttpParams().set('currentPassword', payload.currentPassword).set('newPassword', payload.newPassword);
    return this.http.put(this.baseUrl+ 'api/auth/password/change', params, { headers: headers });
  }

  /**
   * This function gets the cart data of current user by sending an HTTP GET request with the JWT Token of the user 
   * that the back-end server uses to identify the user and if after a series of security validations the token is valid, 
   * it sends back the data as JSON.
   * 
   */
  loadCart() {
    this.loader.showLoader();
    this.http.get(this.cartEndpoint).subscribe(
      (res: any) => {
        this.cart = res.data;
      },
      err => {
        console.log(err);
      },

      () => {
        this.loader.hideLoader();
      }
    ); 
  }
  

  /**
   * This function is used to add an item to the user's cart.
   * 
   * @param item 
   * @param quantity 
   */
  addToCart(item: any, quantity: any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let params = new HttpParams().set('itemId', item.id).set('quantity', quantity);
    this.http.post(this.baseUrl+ 'api/auth/cart/add', params, { headers: headers }).subscribe(
      data => {
        let res: any = data;
        M.toast({ html: res.data.message });
      },
      err => {
        console.log(err);
      }
    );
  }

  /**
   * This function is used to delete an item from the user's cart.
   * 
   * @param item 
   */
  removeFromCart(item: any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const options = {
      headers: headers,
      body: 'itemId='+ item.id
    };
    this.http.delete(this.baseUrl+ 'api/auth/cart/remove', options).subscribe(
      data => {
        let res: any = data;
        M.toast({ html: res.data.message });
        this.loadCart();
      },
      err => {
        console.log(err);
      }
    );
  }

  /**
   * This function is used to increase the quantity of an item in the user's cart by 1.
   * It sends an HTTP PUT Request to the back-end and with the JWT, the back-end identifies the user and
   * increases the quantity of the item by it's ID that is send in the Request body.
   * 
   * @param id 
   */
  increaseCartQuantity(id) {
    let params = new HttpParams().set('itemId', id);
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.put(this.baseUrl+ 'api/auth/cart/increase', params, { headers: headers });
  }


  /**
   * This function is used to decrease quantity of an item in the user's cart by 1.
   * It sends an HTTP PUT Request to the back-end and with the JWT, the back-end identifies the user and 
   * decreases the item by the id that is sent in the Request body.
   * 
   * @param id 
   */
  decreaseCartQuantity(id) {
    let params = new HttpParams().set('itemId', id);
    let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.put(this.baseUrl+ 'api/auth/cart/decrease', params, { headers: headers });
  }


  /**
   * This function is used to register a new user.
   * It receives a User object from the registration component and sends an HTTP POST request to the backend.
   * The server then checks if the data is valid and if so persists it to the db and responds with an success message.
   * 
   * @param payload 
   */
  register(payload: User) {
    return this.http.post(this.registerEndpoint, JSON.stringify(payload));
  }

  /**
   * This function is used to login.
   * It receives as a parameter an array of data [username: string, password: string, rememberme: boolean] 
   * which it sends to the back-end as an HTTP Post request for authentication.
   * If the username and password were incorrect, the back-end responds with an HTTP Response of 401 Unauthorized with a message.
   * If the username and password were correct, the back-end responds with an HTTP Response of 200 OK with the JWT token and an Refresh token.
   * After receiving the HTTP Response this function returns the result as an Observale to the LoginComponent to process.
   * 
   * @param payload 
   * @returns Observable
   */
  authenticate(payload: any) {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.loginEndpoint, JSON.stringify(payload), {headers: headers});
  }


  /**
   * This function is used to logout. 
   * It deletes everything from local storage and redirects the user to the home page.
   */
  logout() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.rememberKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/']);
  }

  /**
   * This function first checks if the User exists in local storage, if it does, it sets it to the global user variable, if it does not, 
   * it it sends an HTTP GET request to the back-end with JWT token to get the User which after completing it sets it to the global user variable.
   */
  loadUser() {
    this.loader.showLoader();
    let user = JSON.parse(localStorage.getItem(this.userKey));

    if (user !== null) {
      this.user = new User(user);
      this.loader.hideLoader();
    } else {
      this.http.get(this.accountEndpoint, { headers: new HttpHeaders({'Content-Type': 'application/json'}) })
                    .subscribe(
                      data => {
                        let res: any = data;
                        this.user = new User(res.data);
                        this.storeUser(this.user);
                      },
                      err => {
                        console.log(err);
                      },
                      () => {
                        this.loader.hideLoader();
                      }
                    );
    }
  }


  reloadUser() {
    localStorage.removeItem(this.userKey);
    this.loadUser();
  }


  /**
   * This function receives 2 params, which are an array which contains the JWT token and a refresh token, and a boolean
   * which determines if the refresh token should be saved for re use.
   * 
   * @param data 
   * @param rememberme 
   */
  setData(data, rememberme) {
    this.storeToken(data.token);
    if (rememberme)
    {
      this.storeRefreshToken(data.refresh_token);
      this.storeRememberMe('1');
    }
  }

  /**
   * This function receives an object of type 'User' and stores it in local storage for re use.
   * 
   * @param user
   */
  storeUser(user: User) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * This function checks first if the JWT token is available and if so it checks if it is expired or not.
   * 
   * @returns boolean
   */
  isLoggedIn() {
    const token = this.getToken();
    if (token === null) {
      return false;
    }
    
    if (!this.helper.isTokenExpired(token)) {
      return true;
    }else {
      this.logout();
      return false;
    }
  }
  
  setCart(cart: any) {
    this.cart = cart;
  }

  getCart() {
    return this.cart;
  }


  /**
   * This function checks first if the current user is logged in and if so, it checks if the current user is an administration or not.
   * 
   * @returns boolean
   */
  isAdmin() {
    if (this.isLoggedIn() && this.user !== null) {
      return this.user.$roles.includes('ROLE_ADMIN');
    } else {
      return false;
    }
  }

  /**
   * This function first checks if the current user is logged in and if so, it checks if the user is an owner or not.
   * 
   * @returns boolean
   */
  isOwner() {
    if (this.isLoggedIn() && this.user !== null) {
      return this.user.$roles.includes('ROLE_OWNER') && this.user.$restaurant !== undefined;
    } else {
      return false;
    }
  }


  /**
   * This function gets the token from local storage and returns it as a string.
   * 
   * @returns string
   */
  getToken() {
    return localStorage.getItem(this.storageKey);
  }

  /**
   * This function receives the JWT token as a parameter and stores it in local storage.
   * 
   * @param token 
   */
  storeToken(token: string) {
    localStorage.setItem(this.storageKey, token);
  }

  /**
   * This function gets the refresh token from local storage and returns it as a string.
   * 
   * @returns string
   */
  getRefreshToken() {
    return localStorage.getItem(this.refreshKey);
  }

  /**
   * This function receives the refresh token as a parameter and stores it in local storage.
   * 
   * @param token
   */
  storeRefreshToken(token: string) {
    localStorage.setItem(this.refreshKey, token);
  }

  /**
   * This function receives the remember me varialble as a boolean and stores it in local storage.
   * 
   * @param value 
   */
  storeRememberMe(value: string) {
    localStorage.setItem(this.rememberKey, value);
  }

  /**
   * This function gets the remember me variable from local storage and returns it as a boolean
   * 
   * @returns boolean
   */
  getRememberMe() {
    let remember = localStorage.getItem(this.rememberKey);
    if (remember === null || remember === undefined || remember === '0') {
      return false;
    } else if (remember === '1') {
      return true;
    }
  }

}
