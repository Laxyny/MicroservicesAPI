import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { HomepageComponent } from './homepage/homepage.component';
import { CreateStoreComponent } from './create-store/create-store.component';
import { AuthGuard } from './guards/auth.guard';
import { StoreDetailsComponent } from './store-details/store-details.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { MyStoreComponent } from './my-store/my-store.component';
import { SellerGuard } from './guards/seller.guard';
import { UserSettingsComponent } from './user-settings/user-settings.component';

export const routes: Routes = [
    //AUTH
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: '', component: HomeComponent },
    { path: 'auth/google/callback', component: HomepageComponent, canActivate: [AuthGuard] },
    //{ path: '', redirectTo: '/login', pathMatch: 'full' },

    //USER
    { path: 'user/settings', component: UserSettingsComponent, canActivate: [AuthGuard] },

    //HOMEPAGE
    { path: 'homepage', component: HomepageComponent, canActivate: [AuthGuard] },

    //STORES && PRODUCTS
    { path: 'seller/store/:id', component: StoreDetailsComponent, canActivate: [AuthGuard] },
    { path: 'product/:id', component: ProductDetailsComponent, canActivate: [AuthGuard] },

    //GESTION STORES
    { path: 'seller/createStore', component: CreateStoreComponent, canActivate: [AuthGuard, SellerGuard] },
    { path: 'seller/my-store', component: MyStoreComponent, canActivate: [AuthGuard, SellerGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
