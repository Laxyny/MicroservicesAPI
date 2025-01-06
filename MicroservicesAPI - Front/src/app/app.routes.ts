import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { HomepageComponent } from './homepage/homepage.component';
import { CreateStoreComponent } from './create-store/create-store.component';
import { AuthGuard } from './guards/auth.guard';
import { StoreDetailsComponent } from './store-details/store-details.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: '', component: HomeComponent },
    //{ path: '', redirectTo: '/login', pathMatch: 'full' },

    //Homepage
    { path: 'homepage', component: HomepageComponent, canActivate: [AuthGuard] },
    { path: 'seller/store/:id', component: StoreDetailsComponent }, //Aller sur la page d'une boutique

    //Create store
    { path: 'seller/createStore', component: CreateStoreComponent, canActivate: [AuthGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
