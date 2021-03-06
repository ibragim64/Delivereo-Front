import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  private nav:any;

  constructor(private router: Router, public auth: AuthService) { }

  ngOnInit() {
    if (this.router.url === '') {
      this.nav = document.getElementById('nav');
      this.nav.classList.add('top');
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e){
    if (this.router.url === '') {
      if (window.pageYOffset > 5) {
        this.nav.classList.remove("top");
      }else{
        this.nav.classList.add('top');
      }
    }
  }

  logout() {
    this.auth.logout();
  }

  checkUserRole(role: string) {
    this.auth.user.checkRole(role);
  }

}
