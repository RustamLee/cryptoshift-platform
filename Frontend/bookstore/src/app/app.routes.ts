import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { RegisterComponent } from './pages/register/register';
import { LoginComponent } from './pages/login/login';
import { ProfileComponent } from './pages/profile/profile-client';
import { ProfileWrapperComponent } from './pages/profile/profile-wrapper';
import { ProfileSellerComponent } from './pages/profile/profile-seller';
import { SellerCatalogComponent } from './pages/profile/seller-catalog';
import { SellerSalesComponent } from './pages/profile/seller-sales';
import { ProfileAdminComponent } from './pages/profile/profile-admin';
import { GenresAdminComponent } from './pages/profile/genres-admin';
import { AuthorsAdminComponent } from './pages/profile/authors-admin';
import { ProfileDefaultComponent } from './pages/profile/profile-default';
import { UsersAdminComponent } from './pages/profile/users-admin';
import { SellerRequestsAdminComponent } from './pages/profile/seller-requests-admin';
import { SellerGuard } from './pages/profile/seller.guard';
import { SellerResolver } from './pages/profile/seller.resolver';
import { AboutComponent } from './pages/about/about';
import { CardsClientComponent } from './pages/profile/cards-client';
import { ComprasClientComponent } from './pages/profile/compras-client';
import { CartComponent } from './pages/cart/cart';
import { ChangePasswordComponent } from './pages/change-password/change-password';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'profile',
    component: ProfileWrapperComponent,
    children: [
      { path: 'client', component: ProfileComponent },
      { path: 'client/cards', component: CardsClientComponent },
      { path: 'client/compras', component: ComprasClientComponent },
      {
        path: 'seller',
        component: ProfileSellerComponent,
        canActivate: [SellerGuard],
        resolve: { sellerProfile: SellerResolver },
        children: [
          { path: 'sales', component: SellerSalesComponent, canActivate: [SellerGuard] },
          { path: 'catalog', component: SellerCatalogComponent, canActivate: [SellerGuard] },
          { path: 'catalog/new', component: SellerCatalogComponent, canActivate: [SellerGuard] },
        ],
      },
      {
        path: 'admin',
        component: ProfileAdminComponent,
        children: [
          { path: 'genres', component: GenresAdminComponent },
          { path: 'authors', component: AuthorsAdminComponent },
          { path: 'users', component: UsersAdminComponent },
          { path: 'seller-requests', component: SellerRequestsAdminComponent },
        ],
      },
      { path: '', component: ProfileDefaultComponent },
    ],
  },
  {path: 'cart', component: CartComponent}
  ,{ path: 'change-password', component: ChangePasswordComponent }
];
