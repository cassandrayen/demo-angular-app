import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
interface UserProfile {
  id: number;
  username: string; // Required property
}
export class AppComponent {
  title = 'demo-angular-app';
  user: UserProfile = {
    id: 101,
  };
}
